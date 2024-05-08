/* eslint-disable @typescript-eslint/quotes,@typescript-eslint/explicit-function-return-type,one-var */
import "expect-even-more-jest";
import { faker } from "@faker-js/faker";
import { ExecStepContext } from "../src";
import { ExecStepConfiguration, Labelers } from "../src/types";
import { sleep } from "expect-even-more-jest";
import Mock = jest.Mock;

const realStdoutWrite = process.stdout.write.bind(process.stdout);
const realStdErrWrite = process.stderr.write.bind(process.stderr);

describe(`exec-step`, () => {
  describe(`synchronous functions`, () => {
    it(`should run the func`, async () => {
      // Arrange
      let called = false;
      const
        sut = create(),
        label = faker.word.words(),
        func = () => called = true;
      // Act
      sut.exec(label, func);
      // Assert
      expect(called)
        .toBeTrue();
    });

    it(`should return the value from the function`, async () => {
      // Arrange
      const
        sut = create(),
        label = faker.word.words(),
        expected = faker.word.words(),
        func = () => expected;
      // Act
      const result = sut.exec(label, func);
      // Assert
      expect(result)
        .toEqual(expected);
    });

    it(`should print the label for no throw`, async () => {
      // Arrange
      const
        sut = create(),
        label = faker.word.words(),
        func = () => {
          // intentionally blank
        };
      // Act
      void sut.exec(label, func);
      // Assert
      expect(process.stdout.write)
        .toHaveBeenCalledTimes(2);
      const calls = (process.stdout.write as Mock).mock.calls;
      expect(calls[0][0])
        .toContain(label);
      expect(calls[0][0])
        .toContain("WAIT");
      expect(calls[1][0])
        .toContain(label);
      expect(calls[1][0])
        .toContain("OK");
    });

    describe(`indentation`, () => {
      beforeEach(() => {
        process.env.NO_COLOR = "1";
      });
      afterEach(() => {
        process.env.NO_COLOR = undefined;
      });
      describe(`ci`, () => {
        it(`should indent by the provided character count`, async () => {
          // Arrange
          const
            sut = create({
              indent: 2
            }),
            label = faker.word.words(),
            func = () => {
              // intentionally blank
            };
          // Act
          void sut.exec(label, func);
          // Assert
          expect(process.stdout.write)
            .toHaveBeenCalledTimes(2);
          const mock = (process.stdout.write as jest.Mock).mock;
          expect(mock.calls[0][0])
            .toEqual(`\r\r  [ WAIT ] ${label}`);
          const clear = " ".repeat(`[  OK  ] ${label}`.length);
          const x = mock.calls[1][0];
          const parts = x.split("\r");
          expect(parts[0])
            .toBeEmptyString();
          expect(parts[1])
            .toEqual(clear);
          expect(parts[2])
            .toEqual(`  [  OK  ] ${label}\n`);
        });
      });

      describe(`interactive`, () => {
        it(`should indent by the provided character count`, async () => {
          // Arrange
          const
            prefixes = {
              wait: "⏰",
              ok: "👍",
              fail: "💥"
            },
            sut = create({
              indent: 2,
              ciMode: false,
              prefixes
            }),
            label = faker.word.words(),
            func = () => {
              // intentionally blank
            };
          // Act
          void sut.exec(label, func);
          // Assert
          expect(process.stdout.write)
            .toHaveBeenCalledTimes(2);
          expect(process.stdout.write)
            .toHaveBeenCalledWith(`\r\r  ${prefixes.wait} ${label}`);
          const clear = " ".repeat(`${prefixes.wait} ${label}`.length);
          const expected = `\r${clear}\r  👍 ${label}\n`;
          expect(process.stdout.write)
            .toHaveBeenCalledWith(expected);
        });
      });
    });

    describe(`default behavior`, () => {
      it(`should print the label for throw & the error message`, async () => {
        // Arrange
        const
          sut = create({ throwErrors: false }),
          label = faker.word.words(),
          error = faker.word.words(),
          func = () => {
            throw new Error(error);
          };
        // Act
        await sut.exec(label, func);
        // Assert
        expect(process.stdout.write)
          .toHaveBeenCalledTimes(2);
        const calls = (process.stdout.write as Mock).mock.calls;
        expect(calls[0][0])
          .toContain(label);
        expect(calls[0][0])
          .toContain("WAIT");
        expect(calls[1][0])
          .toContain(label);
        expect(calls[1][0])
          .toContain("FAIL");

        expect(process.stderr.write)
          .toHaveBeenCalledOnceWith(
            expect.stringMatching(error)
          );
      });
      beforeEach(() => {
        spyOnIo();
      });
    });

    describe(`when configured not to display errors`, () => {
      it(`should print the label for throw _only_`, async () => {
        // Arrange
        const
          sut = create({ throwErrors: false }),
          label = faker.word.words(),
          error = faker.word.words(),
          func = () => {
            throw new Error(error);
          };
        // Act
        sut.suppressErrorReporting();
        await sut.exec(label, func);
        // Assert
        expect(process.stdout.write)
          .toHaveBeenCalledTimes(2);
        const calls = (process.stdout.write as Mock).mock.calls;
        expect(calls[0][0])
          .toContain(label);
        expect(calls[0][0])
          .toContain("WAIT");
        expect(calls[1][0])
          .toContain(label);
        expect(calls[1][0])
          .toContain("FAIL");

        expect(process.stderr.write)
          .not.toHaveBeenCalledOnceWith(
          expect.stringMatching(error)
        );
      });

      it(`should allow partial prefix config`, async () => {
        // Arrange
        const
          sut = create({
            throwErrors: false,
            prefixes: {
              ok: "🐮"
            }
          });
        // Act
        await sut.exec(faker.string.alphanumeric(), () => {
        });
        // Assert
        const calls = (process.stdout.write as Mock).mock.calls;
        expect(calls[0][0])
          .toContain("🟡");
        expect(calls[1][0])
          .toContain("🐮");
      });
      beforeEach(() => {
        spyOnIo();
      });
    });
    beforeEach(() => {
      spyOnIo();
    });
  });

  describe(`asynchronous functions`, () => {
    it(`should run the func`, async () => {
      // Arrange
      let called = false;
      const
        sut = create(),
        label = faker.word.words(),
        func = async () => called = true;
      // Act
      await sut.exec(label, func);
      // Assert
      expect(called)
        .toBeTrue();
    });

    it(`should return the value from the function`, async () => {
      // Arrange
      const
        sut = create(),
        label = faker.word.words(),
        expected = faker.word.words(),
        func = async () => expected;
      // Act
      const result = await sut.exec(label, func);
      // Assert
      expect(result)
        .toEqual(expected);
    });

    it(`should print the label for no throw`, async () => {
      // Arrange
      const
        sut = create(),
        label = faker.word.words(),
        func = async () => {
          // intentionally blank
        };
      // Act
      await sut.exec(label, func);
      // Assert
      expect(process.stdout.write)
        .toHaveBeenCalledTimes(2);
      const calls = (process.stdout.write as Mock).mock.calls;
      expect(calls[0][0])
        .toContain(label);
      expect(calls[0][0])
        .toContain("WAIT");
      expect(calls[1][0])
        .toContain(label);
      expect(calls[1][0])
        .toContain("OK");
    });

    it(`should print the label for throw`, async () => {
      // Arrange
      const
        sut = create({ throwErrors: false }),
        label = faker.word.words(),
        error = faker.word.words(),
        func = async () => {
          throw new Error(error);
        };
      // Act
      await sut.exec(label, func);
      // Assert
      expect(process.stdout.write)
        .toHaveBeenCalledTimes(2);
      const calls = (process.stdout.write as Mock).mock.calls;
      expect(calls[0][0])
        .toContain(label);
      expect(calls[0][0])
        .toContain("WAIT");
      expect(calls[1][0])
        .toContain(label);
      expect(calls[1][0])
        .toContain("FAIL");

      expect(process.stderr.write)
        .toHaveBeenCalledOnceWith(
          expect.stringMatching(error)
        );
    });
    beforeEach(() => {
      spyOnIo();
    });
  });

  describe(`CI mode`, () => {
    it(`should print the start and ok on the same line`, async () => {
      // Arrange
      const
        ctx = new ExecStepContext({
          ciMode: true
        }),
        label = faker.word.words(3);
      // Act
      await ctx.exec(
        label,
        async () => {
          await sleep(500);
        }
      );
      // Assert
      expect(process.stdout.write)
        .toHaveBeenCalledWith(
          `${label}... `
        );
      expect(process.stdout.write)
        .toHaveBeenCalledWith(
          `[  OK  ]\n`
        );
    });
    beforeEach(() => {
      spyOnIo();
    });
  });

  describe(`suppressing output`, () => {
    it(`should suppress via null-labeller`, async () => {
      // Arrange
      const
        ctx = new ExecStepContext({
          labeler: Labelers.none
        });
      // Act
      ctx.exec("foo to the bar", () => {
      });
      // Assert
      expect(process.stdout.write)
        .not.toHaveBeenCalled();
    });
    beforeEach(() => {
      spyOnIo();
    });
  });

  function create(config?: Partial<ExecStepConfiguration>) {
    if (config && !config.prefixes) {
      config.asciiPrefixes = true;
    }
    return new ExecStepContext(config ?? "ascii");
  }

  const echo = false;

  function spyOnIo() {
    jest.spyOn(process.stdout, "write").mockImplementation(
      (s: string | Uint8Array) => {
        if (echo) {
          realStdoutWrite(s);
        }
        return true;
      });
  }

  jest.spyOn(process.stderr, "write").mockImplementation(
    (s: string | Uint8Array) => {
      if (echo) {
        realStdErrWrite(s);
      }
      return true;
    });
});
