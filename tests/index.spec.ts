import "expect-even-more-jest";
import * as faker from "faker";
import { ExecStepContext, ExecStepConfiguration } from "../src";
import Spy = jasmine.Spy;

describe(`exec-step`, () => {
    describe.skip(`synchronous functions`, () => {
        it(`should run the func`, async () => {
            // Arrange
            let called = false;
            const
                sut = create(),
                label = faker.random.words(),
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
                label = faker.random.words(),
                expected = faker.random.words(),
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
                label = faker.random.words(),
                func = () => {
                    // intentionally blank
                };
            // Act
            sut.exec(label, func);
            // Assert
            expect(process.stdout.write)
                .toHaveBeenCalledTimes(2);
            const calls = (process.stdout.write as Spy).calls.all();
            expect(calls[0].args[0])
                .toContain(label);
            expect(calls[0].args[0])
                .toContain("WAIT");
            expect(calls[1].args[0])
                .toContain(label);
            expect(calls[1].args[0])
                .toContain("OK");
        });
        it(`should print the label for throw`, async () => {
            // Arrange
            const
                sut = create({ throwErrors: false }),
                label = faker.random.words(),
                error = faker.random.words(),
                func = () => {
                    throw new Error(error);
                };
            // Act
            sut.exec(label, func);
            // Assert
            expect(process.stdout.write)
                .toHaveBeenCalledTimes(2);
            const calls = (process.stdout.write as Spy).calls.all();
            expect(calls[0].args[0])
                .toContain(label);
            expect(calls[0].args[0])
                .toContain("WAIT");
            expect(calls[1].args[0])
                .toContain(label);
            expect(calls[1].args[0])
                .toContain("FAIL");

            expect(process.stderr.write)
                .toHaveBeenCalledOnceWith(
                    jasmine.stringMatching(error)
                );
        });
    });

    describe.skip(`asynchronous functions`, () => {
        it(`should run the func`, async () => {
            // Arrange
            let called = false;
            const
                sut = create(),
                label = faker.random.words(),
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
                label = faker.random.words(),
                expected = faker.random.words(),
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
                label = faker.random.words(),
                func = async () => {
                    // intentionally blank
                };
            // Act
            await sut.exec(label, func);
            // Assert
            expect(process.stdout.write)
                .toHaveBeenCalledTimes(2);
            const calls = (process.stdout.write as Spy).calls.all();
            expect(calls[0].args[0])
                .toContain(label);
            expect(calls[0].args[0])
                .toContain("WAIT");
            expect(calls[1].args[0])
                .toContain(label);
            expect(calls[1].args[0])
                .toContain("OK");
        });
        it(`should print the label for throw`, async () => {
            // Arrange
            const
                sut = create({ throwErrors: false }),
                label = faker.random.words(),
                error = faker.random.words(),
                func = async () => {
                    throw new Error(error);
                };
            // Act
            await sut.exec(label, func);
            // Assert
            expect(process.stdout.write)
                .toHaveBeenCalledTimes(2);
            const calls = (process.stdout.write as Spy).calls.all();
            expect(calls[0].args[0])
                .toContain(label);
            expect(calls[0].args[0])
                .toContain("WAIT");
            expect(calls[1].args[0])
                .toContain(label);
            expect(calls[1].args[0])
                .toContain("FAIL");

            expect(process.stderr.write)
                .toHaveBeenCalledOnceWith(
                    jasmine.stringMatching(error)
                );
        });
    });

    function create(config?: ExecStepConfiguration) {
        if (config) {
            config.asciiPrefixes = true;
        }
        return new ExecStepContext(config ?? "ascii");
    }

    beforeEach(() => {
        spyOn(process.stdout, "write");
        spyOn(process.stderr, "write");
    });
});
