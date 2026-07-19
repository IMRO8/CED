#!/usr/bin/env node
import { createReadStream, createWriteStream } from "node:fs";
import { opendir, mkdir } from "node:fs/promises";
import {
  extname,
  join,
  relative,
  dirname,
  resolve,
} from "node:path";
import { StringDecoder } from "node:string_decoder";
import { once } from "node:events";
type CliOptions = {
  inputDirectory: string;
  outputFile: string;
  chunkSize: number;
  overlap: number;
};

/**
 * Walk through a directory recursively and yield Markdown file paths.
 */
async function* walkMarkdownFiles(
  directory: string,
): AsyncGenerator<string> {
  const dir = await opendir(directory);

  for await (const entry of dir) {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      yield* walkMarkdownFiles(fullPath);
    } else if (
      entry.isFile() &&
      extname(entry.name).toLowerCase() === ".md"
    ) {
      yield fullPath;
    }
  }
}

/**
 * Try to split near a paragraph, line, sentence, or word boundary.
 */
function chooseCutPoint(
  text: string,
  targetSize: number,
): number {
  const searchArea = text.slice(0, targetSize);
  const minimumCutPoint = Math.floor(targetSize * 0.6);

  const boundaries = ["\n\n", "\n", ". ", " "];

  for (const boundary of boundaries) {
    const index = searchArea.lastIndexOf(boundary);

    if (index >= minimumCutPoint) {
      return index + boundary.length;
    }
  }

  return targetSize;
}

/**
 * Stream one Markdown file and yield text chunks.
 */
async function* streamMarkdownChunks(
  filePath: string,
  chunkSize: number,
  overlap: number,
): AsyncGenerator<string> {
  const input = createReadStream(filePath, {
    highWaterMark: 64 * 1024, //64 KB data limit
  });

  const decoder = new StringDecoder("utf8");
  let pending = "";

  for await (const buffer of input) {
    pending += decoder.write(buffer);

    while (pending.length >= chunkSize) {
      const cutPoint = chooseCutPoint(
        pending,
        chunkSize,
      );

      const consumed = pending.slice(0, cutPoint);
      const text = consumed.trim();

      if (text.length > 0) {
        yield text;
      }

      const retainedOverlap = consumed.slice(
        Math.max(0, consumed.length - overlap),
      );

      pending =
        retainedOverlap +
        pending.slice(cutPoint);
    }
  }

  pending += decoder.end();

  const finalText = pending.trim();

  if (finalText.length > 0) {
    yield finalText;
  }
}

/**
 * Write output while respecting stream backpressure.
 */
async function writeWithBackpressure(
  output: ReturnType<typeof createWriteStream>,
  data: string,
): Promise<void> {
  const canContinue = output.write(data, "utf8");

  if (!canContinue) {
    await once(output, "drain");
  }
}

/**
 * Parse command-line arguments.
 */
function parseArguments(args: string[]): CliOptions {
  const inputArgument = args[0];
  const outputArgument = args[1];

  if (!inputArgument || !outputArgument) {
    throw new Error(
      [
        "Usage:",
        "node injest.ts <input-directory> <output-file>",
        "  [--size 4000]",
        "  [--overlap 300]",
      ].join(" "),
    );
  }

  let chunkSize = 4000;
  let overlap = 300;

  for (let index = 2; index < args.length; index++) {
    const argument = args[index];

    if (argument === "--size") {
      const value = args[index + 1];

      if (!value) {
        throw new Error(
          "--size requires a numeric value",
        );
      }

      chunkSize = Number(value);
      index++;
    } else if (argument === "--overlap") {
      const value = args[index + 1];

      if (!value) {
        throw new Error(
          "--overlap requires a numeric value",
        );
      }

      overlap = Number(value);
      index++;
    } else {
      throw new Error(
        `Unknown argument: ${argument}`,
      );
    }
  }

  if (
    !Number.isInteger(chunkSize) ||
    chunkSize <= 0
  ) {
    throw new Error(
      "--size must be a positive integer",
    );
  }

  if (
    !Number.isInteger(overlap) ||
    overlap < 0
  ) {
    throw new Error(
      "--overlap must be a non-negative integer",
    );
  }

  if (overlap >= chunkSize) {
    throw new Error(
      "--overlap must be smaller than --size",
    );
  }

  return {
    inputDirectory: resolve(inputArgument),
    outputFile: resolve(outputArgument),
    chunkSize,
    overlap,
  };
}

/**
 * Main CLI operation.
 */
async function main(): Promise<void> {
  const options = parseArguments(
    process.argv.slice(2),
  );

  const {
    inputDirectory,
    outputFile,
    chunkSize,
    overlap,
  } = options;

  await mkdir(dirname(outputFile), {
    recursive: true,
  });

  const output = createWriteStream(outputFile, {
    encoding: "utf8",
    flags: "w",
  });

  let filesProcessed = 0;
  let chunksWritten = 0;
  let firstRecord = true;

  console.log(
    `Reading Markdown files from: ${inputDirectory}`,
  );

  console.log(
    `Writing JSON to: ${outputFile}`,
  );

  try {
    await writeWithBackpressure(
      output,
      [
        "{",
        '  "format": "markdown-chunks-v1",',
        `  "chunkSize": ${chunkSize},`,
        `  "overlap": ${overlap},`,
        '  "chunks": [',
        "",
      ].join("\n"),
    );

    for await (
      const filePath of walkMarkdownFiles(
        inputDirectory,
      )
    ) {
      console.log(`Processing: ${filePath}`);

      let fileChunkIndex = 0;

      for await (
        const text of streamMarkdownChunks(
          filePath,
          chunkSize,
          overlap,
        )
      ) {
        const record = {
          id: chunksWritten,
          source: relative(
            inputDirectory,
            filePath,
          ),
          chunkIndex: fileChunkIndex,
          text,
        };

        const prefix = firstRecord
          ? "    "
          : ",\n    ";

        await writeWithBackpressure(
          output,
          prefix + JSON.stringify(record),
        );

        firstRecord = false;
        fileChunkIndex++;
        chunksWritten++;
      }

      filesProcessed++;
    }

    output.end(
      [
        "",
        "  ],",
        `  "filesProcessed": ${filesProcessed},`,
        `  "chunksWritten": ${chunksWritten}`,
        "}",
        "",
      ].join("\n"),
    );

    await once(output, "finish");

    console.log(
      `Completed: ${filesProcessed} files and ${chunksWritten} chunks.`,
    );

    console.log(
      `Output created at: ${outputFile}`,
    );
  } catch (error) {
    output.destroy();
    throw error;
  }
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : String(error);

  console.error(`Error: ${message}`);
  process.exitCode = 1;
});