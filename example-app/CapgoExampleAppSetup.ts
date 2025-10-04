import { join } from "node:path";
import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { MobileProject, type MobileProjectConfig } from "@trapezedev/project";

type Palette = [string, string, string, string];

type CliArgs = {
  shortName: string;
  fullName: string;
};

type PackageJson = {
  devDependencies?: Record<string, string>;
};

const palettes: Palette[] = [
  ["#77BEF0", "#FFCB61", "#FF894F", "#EA5B6F"],
  ["#FF2DD1", "#FDFFB8", "#4DFFBE", "#63C8FF"],
  ["#722323", "#BA487F", "#FF9587", "#FFECCC"],
  ["#347433", "#FFC107", "#FF6F3C", "#B22222"],
  ["#0B1D51", "#725CAD", "#8CCDEB", "#FFE3A9"],
  ["#F4E7E1", "#FF9B45", "#D5451B", "#521C0D"],
  ["#F3F3E0", "#27548A", "#183B4E", "#DDA853"],
  ["#000000", "#8E1616", "#E8C999", "#F8EEDF"],
  ["#8F87F1", "#C68EFD", "#E9A5F1", "#FED2E2"],
  ["#F5ECE0", "#5F99AE", "#336D82", "#693382"],
];

const FONT_NAME = "HelveticaNeue-Bold";
const GLYPH_TOOL_RELATIVE_PATH = ".codex/glyph-to-path.swift";

type RawGlyph = {
  path: string;
  advance: number;
  minX: number;
  maxX: number;
  height: number;
};

type GlyphBounds = {
  minX: number;
  maxX: number;
  height: number;
};

const glyphCache = new Map<string, RawGlyph[]>();

const glyphToolSource = String.raw`#!/usr/bin/env swift
import CoreText
import CoreGraphics
import Foundation

struct Glyph: Codable {
    let path: String
    let advance: Double
    let minX: Double
    let maxX: Double
    let height: Double
}

extension CGPath {
    func svgPath() -> String {
        var commands: [String] = []
        let formatter: NumberFormatter = {
            let f = NumberFormatter()
            f.minimumFractionDigits = 0
            f.maximumFractionDigits = 3
            f.minimumIntegerDigits = 1
            f.decimalSeparator = "."
            return f
        }()

        self.applyWithBlock { elementPointer in
            let element = elementPointer.pointee
            let points = element.points
            func format(_ point: CGPoint) -> String {
                let x = formatter.string(from: NSNumber(value: Double(point.x))) ?? "0"
                let y = formatter.string(from: NSNumber(value: Double(point.y))) ?? "0"
                return "\(x) \(y)"
            }
            switch element.type {
            case .moveToPoint:
                commands.append("M \(format(points[0]))")
            case .addLineToPoint:
                commands.append("L \(format(points[0]))")
            case .addQuadCurveToPoint:
                commands.append("Q \(format(points[0])) \(format(points[1]))")
            case .addCurveToPoint:
                commands.append("C \(format(points[0])) \(format(points[1])) \(format(points[2]))")
            case .closeSubpath:
                commands.append("Z")
            @unknown default:
                break
            }
        }
        return commands.joined(separator: " ")
    }
}

let args = CommandLine.arguments
if args.count < 3 {
    FileHandle.standardError.write(Data("Usage: glyph-tool <FONT_NAME> <TEXT>\n".utf8))
    exit(1)
}
let fontName = args[1] as CFString
let text = args[2]
let size: CGFloat = 1000
let font = CTFontCreateWithName(fontName, size, nil)
var glyphs: [Glyph] = []

for scalar in text.unicodeScalars {
    var unicode = UniChar(scalar.value)
    var glyph = CGGlyph()
    guard CTFontGetGlyphsForCharacters(font, &unicode, &glyph, 1) else {
        continue
    }
    var advance = CGSize.zero
    CTFontGetAdvancesForGlyphs(font, .horizontal, &glyph, &advance, 1)
    guard var path = CTFontCreatePathForGlyph(font, glyph, nil) else {
        glyphs.append(Glyph(path: "", advance: Double(advance.width), minX: 0, maxX: Double(advance.width), height: 0))
        continue
    }
    var flip = CGAffineTransform(scaleX: 1, y: -1)
    if let flipped = path.copy(using: &flip) {
        path = flipped
    }
    let originalBounds = path.boundingBox
    var translate = CGAffineTransform(translationX: 0, y: -originalBounds.minY)
    if let translated = path.copy(using: &translate) {
        path = translated
    }
    let svg = path.svgPath()
    let bounds = path.boundingBox
    glyphs.append(Glyph(path: svg, advance: Double(advance.width), minX: Double(originalBounds.minX), maxX: Double(originalBounds.maxX), height: Double(bounds.maxY)))
}

let encoder = JSONEncoder()
if let data = try? encoder.encode(glyphs) {
    FileHandle.standardOutput.write(data)
} else {
    exit(1)
}
`;

const ensureGlyphTool = async (projectDir: string) => {
  const toolPath = join(projectDir, GLYPH_TOOL_RELATIVE_PATH);
  await mkdir(join(projectDir, ".codex"), { recursive: true });
  try {
    await readFile(toolPath, "utf8");
  } catch {
    await Bun.write(toolPath, glyphToolSource);
  }
  return toolPath;
};

const runGlyphTool = async (projectDir: string, text: string): Promise<RawGlyph[]> => {
  if (glyphCache.has(text)) {
    return glyphCache.get(text)!;
  }

  const toolPath = await ensureGlyphTool(projectDir);
  const moduleCacheDir = join(projectDir, ".codex/swift-module-cache");
  await mkdir(moduleCacheDir, { recursive: true });
  const child = Bun.spawn({
    cmd: ["swift", "-module-cache-path", moduleCacheDir, toolPath, FONT_NAME, text],
    cwd: projectDir,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ...process.env,
      SWIFT_MODULE_CACHE_PATH: moduleCacheDir,
    },
  });

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);

  if (exitCode !== 0) {
    throw new Error(`glyph tool failed (${text}): ${stderr.trim()}`);
  }

  try {
    const parsed = JSON.parse(stdout) as RawGlyph[];
    glyphCache.set(text, parsed);
    return parsed;
  } catch (error) {
    throw new Error(`Failed to parse glyph data for "${text}": ${(error as Error).message}`);
  }
};

const pathRect = (x: number, y: number, width: number, height: number, fill: string) =>
  `    <path d="M ${x} ${y} H ${x + width} V ${y + height} H ${x} Z" fill="${fill}" />`;

const invertHexColour = (hex: string) => {
  const normalised = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((index) => parseInt(normalised.slice(index, index + 2), 16));
  const inverted = [r, g, b].map((channel) => (255 - channel).toString(16).padStart(2, "0"));
  return `#${inverted.join("")}`;
};

const pickPalette = (): Palette => {
  const index = Math.floor(Math.random() * palettes.length);
  return palettes[index];
};

const buildLetterElements = async (
  letters: string[],
  projectDir: string,
  availableWidth: number,
  topLeft: string,
  topRight: string,
  bottomLeft: string,
  bottomRight: string,
) => {
  const glyphs = await runGlyphTool(projectDir, letters.join(""));
  const desiredHeight = 85;

  const glyphHeights = glyphs.map((glyph) => glyph.height);
  const maxHeight = Math.max(...glyphHeights, 1);
  const verticalScale = desiredHeight / maxHeight;
  let horizontalScale = verticalScale;
  const advances = glyphs.map((glyph) => glyph.advance);

  const initialSpacing = letters.length > 1 ? desiredHeight * 0.14 : 0;
  const minimumSpacing = letters.length > 1 ? desiredHeight * 0.05 : 0;
  let spacing = initialSpacing;

  const sumAdvances = advances.reduce((sum, value) => sum + value, 0);

  const totalWidthWithSpacing = (scaleX: number, currentSpacing: number) =>
    sumAdvances * scaleX + currentSpacing * (letters.length - 1);

  if (letters.length > 1) {
    let total = totalWidthWithSpacing(horizontalScale, spacing);
    if (total > availableWidth && spacing > minimumSpacing) {
      const excess = total - availableWidth;
      const spacingReductionCapacity = (spacing - minimumSpacing) * (letters.length - 1);
      if (spacingReductionCapacity > 0) {
        const adjustedSpacing = spacing - Math.min(excess, spacingReductionCapacity) / (letters.length - 1);
        spacing = Math.max(adjustedSpacing, minimumSpacing);
        total = totalWidthWithSpacing(horizontalScale, spacing);
      }
    }

    let totalAfterSpacing = totalWidthWithSpacing(horizontalScale, spacing);
    if (totalAfterSpacing > availableWidth) {
      const scaleFactor = availableWidth / totalAfterSpacing;
      horizontalScale *= scaleFactor;
      spacing *= scaleFactor;
    }
  }

  const topFills = [invertHexColour(topLeft), invertHexColour(topRight)] as const;
  const bottomFills = [invertHexColour(bottomLeft), invertHexColour(bottomRight)] as const;

  const clipDefs: string[] = [];
  const fillGroups: string[] = [];

  const totalWidth = totalWidthWithSpacing(horizontalScale, spacing);
  let currentLeft = 50 - totalWidth / 2;

  letters.forEach((char, index) => {
    const glyph = glyphs[index] ?? glyphs[glyphs.length - 1];
    const clipId = `letter-clip-${index}`;
    const letterHeight = glyph.height * verticalScale;
    const yOffset = 50 - letterHeight / 2;
    const transform =
      `translate(${(currentLeft - glyph.minX * horizontalScale).toFixed(3)},${yOffset.toFixed(3)}) scale(${horizontalScale.toFixed(3)},${verticalScale.toFixed(3)})`;

    clipDefs.push(
      `    <clipPath id="${clipId}">\n` +
        `      <path d="${glyph.path}" transform="${transform}" />\n` +
        `    </clipPath>`,
    );

    const letterLeft = currentLeft;
    const letterRight = currentLeft + (glyph.maxX - glyph.minX) * horizontalScale;

    if (letters.length === 3 && index === 1) {
      fillGroups.push(
        `  <g clip-path="url(#${clipId})">\n` +
          `${pathRect(0, 0, 50, 50, topFills[0])}\n` +
          `${pathRect(50, 0, 50, 50, topFills[1])}\n` +
          `${pathRect(0, 50, 50, 50, bottomFills[0])}\n` +
          `${pathRect(50, 50, 50, 50, bottomFills[1])}\n` +
          `  </g>`,
      );
    } else {
      const leftOverlap = Math.max(0, Math.min(50, letterRight) - Math.max(0, letterLeft));
      const rightOverlap = Math.max(0, Math.min(100, letterRight) - Math.max(50, letterLeft));

      let column: 0 | 1 = 0;
      if (rightOverlap > leftOverlap) {
        column = 1;
      } else if (rightOverlap === leftOverlap && letterLeft + (letterRight - letterLeft) / 2 >= 50) {
        column = 1;
      }

      fillGroups.push(
        `  <g clip-path="url(#${clipId})">\n` +
          `${pathRect(0, 0, 100, 50, topFills[column])}\n` +
          `${pathRect(0, 50, 100, 50, bottomFills[column])}\n` +
          `  </g>`,
      );
    }

    currentLeft += glyph.advance * horizontalScale + spacing;
  });

  return {
    clipPaths: clipDefs.join("\n"),
    letterGroups: fillGroups.join("\n"),
  } as const;
};

export const generateIconSvg = async (shortName: string, fullName: string, outputPath: string) => {
  const palette = pickPalette();
  const [topLeft, topRight, bottomLeft, bottomRight] = palette;

  const letters = Array.from(shortName);
  const scriptDir = fileURLToPath(new URL(".", import.meta.url));
  const availableWidth = letters.length === 3 ? 94 : 85;

  const { clipPaths, letterGroups } = await buildLetterElements(
    letters,
    scriptDir,
    availableWidth,
    topLeft,
    topRight,
    bottomLeft,
    bottomRight,
  );

  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 100 100">\n` +
    `  <defs>\n${clipPaths}\n  </defs>\n` +
    `  <rect x="0" y="0" width="50" height="50" fill="${topLeft}" />\n` +
    `  <rect x="50" y="0" width="50" height="50" fill="${topRight}" />\n` +
    `  <rect x="0" y="50" width="50" height="50" fill="${bottomLeft}" />\n` +
    `  <rect x="50" y="50" width="50" height="50" fill="${bottomRight}" />\n` +
    `${letterGroups}\n` +
    `</svg>\n`;

  await Bun.write(outputPath, svg);

  return { palette, shortName, fullName, outputPath } as const;
};

export const parseCliArgs = (argv: string[]): CliArgs => {
  if (argv.length < 2) {
    throw new Error("Missing required arguments");
  }

  const [shortNameRaw, ...fullNameParts] = argv;
  const shortName = shortNameRaw.toUpperCase().replace(/\s+/g, "");

  if (shortName.length === 0) {
    throw new Error("Short name cannot be empty");
  }

  if (shortName.length > 3) {
    throw new Error("Short name must be at most 3 characters");
  }

  const fullName = fullNameParts.join(" ").trim();

  if (fullName.length === 0) {
    throw new Error("Full name cannot be empty");
  }

  return { shortName, fullName };
};

const printUsage = () => {
  console.error("Usage: bun run example-app/CapgoExampleAppSetup.ts <SHORT_NAME> <FULL_NAME>");
  console.error("       SHORT_NAME: 1-3 characters (letters or digits)");
  console.error("       FULL_NAME: the descriptive name (quotes required when containing spaces)");
};

const toPascalCase = (value: string) =>
  value
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");

const readPackageJson = async (path: string): Promise<PackageJson> => {
  const file = await readFile(path, "utf8");
  return JSON.parse(file) as PackageJson;
};

const runCommand = async (command: string, args: string[], cwd: string) => {
  console.log(`[INFO] Running command: ${command} ${args.join(" ")}`);
  const process = Bun.spawn({
    cmd: [command, ...args],
    cwd,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });

  const exitCode = await process.exited;
  if (exitCode !== 0) {
    throw new Error(`Command failed (${command} ${args.join(" ")}) with exit code ${exitCode}`);
  }
};

const ensureCapacitorAssets = async (projectDir: string) => {
  const packageJsonPath = join(projectDir, "package.json");
  console.log(`[INFO] Checking dev dependency '@capacitor/assets' in ${packageJsonPath}`);
  const packageJson = await readPackageJson(packageJsonPath);
  const devDependencies = packageJson.devDependencies ?? {};

  if (!devDependencies["@capacitor/assets"]) {
    console.log("[INFO] '@capacitor/assets' not found. Installing as dev dependency.");
    try {
      await runCommand("npm", ["install", "--save-dev", "@capacitor/assets"], projectDir);
    } catch (error) {
      console.error("[ERROR] Failed to install @capacitor/assets");
      throw error;
    }
    const updated = await readPackageJson(packageJsonPath);
    if (updated.devDependencies?.["@capacitor/assets"]) {
      console.log("[INFO] Verified '@capacitor/assets' installation.");
    } else {
      console.warn("[WARN] Unable to verify '@capacitor/assets' installation from package.json.");
    }
  } else {
    console.log("[INFO] '@capacitor/assets' already present.");
  }
};

const configureMobileProjects = async (projectDir: string, appId: string, displayName: string) => {
  console.log(`[INFO] Configuring mobile projects with Trapeze: ${displayName} (${appId})`);
  const trapezeConfig: MobileProjectConfig = {
    ios: { path: "ios/App" },
    android: { path: "android" },
    enableIos: true,
    enableAndroid: true,
  };

  const project = new MobileProject(projectDir, trapezeConfig);
  await project.load();

  if (project.ios) {
    project.ios.setBundleId(null, null, appId);
    project.ios.setProductName(null, displayName);
    await project.ios.setDisplayName(null, null, displayName);
    console.log("[INFO] Applied iOS configuration");
  } else {
    console.warn("[WARN] iOS project not found. Skipping iOS configuration.");
  }

  if (project.android) {
    await project.android.setPackageName(appId);
    await project.android.setAppName(displayName);
    console.log("[INFO] Applied Android configuration");
  } else {
    console.warn("[WARN] Android project not found. Skipping Android configuration.");
  }

  await project.commit();
  console.log("[INFO] Trapeze configuration committed.");
};

const runCapacitorAssets = async (projectDir: string) => {
  console.log("[INFO] Running @capacitor/assets generate command");
  const args = [
    "@capacitor/assets",
    "generate",
    "--iconBackgroundColor",
    "#eeeeee",
    "--iconBackgroundColorDark",
    "#222222",
    "--splashBackgroundColor",
    "#eeeeee",
    "--splashBackgroundColorDark",
    "#111111",
  ];

  try {
    await runCommand("npx", args, projectDir);
  } catch (error) {
    console.error("[ERROR] Failed to run @capacitor/assets generate");
    throw error;
  }
};

const main = async () => {
  try {
    const { shortName, fullName } = parseCliArgs(Bun.argv.slice(2));
    console.log(`[INFO] Short name: ${shortName}`);
    console.log(`[INFO] Full name: ${fullName}`);

    const scriptDir = fileURLToPath(new URL(".", import.meta.url));
    console.log(`[INFO] Script directory resolved to ${scriptDir}`);

    await ensureCapacitorAssets(scriptDir);

    const pascalName = toPascalCase(fullName);
    const appId = `app.capgo.plugin.${pascalName}`;
    const displayName = `${fullName} example app`;

    await configureMobileProjects(scriptDir, appId, displayName);

    const assetsDir = join(scriptDir, "assets");
    const svgPath = join(assetsDir, "logo.svg");
    await mkdir(assetsDir, { recursive: true });
    const svgResult = await generateIconSvg(shortName, fullName, svgPath);
    console.log(`[INFO] Generated icon at ${svgResult.outputPath} using palette ${svgResult.palette.join(", ")}`);

    await runCapacitorAssets(scriptDir);

    console.log("[INFO] Setup completed successfully.");
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[ERROR] ${error.message}`);
    } else {
      console.error("[ERROR] Unknown error", error);
    }
    printUsage();
    process.exitCode = 1;
  }
};

if (import.meta.main) {
  void main();
}
