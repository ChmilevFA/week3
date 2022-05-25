const wasm_tester = require("circom_tester").wasm;
const buildPoseidon = require("circomlibjs").buildPoseidon;
const chai = require("chai");

const assert = chai.assert;
const expect = chai.expect;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

describe('MastermindChallenge test', function () {
    before(async () => {

    });

    it('Should properly validate correct guess', async () => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        const poseidon = await buildPoseidon();
        const salt = 1234;
        const hash = poseidon.F.toString(poseidon([salt, 1, 2, 3, 4, 5]));

        const INPUT = {
            pubGuessA: 1,
            pubGuessB: 2,
            pubGuessC: 3,
            pubGuessD: 4,
            pubGuessE: 5,
            pubNumHit: 5,
            pubNumBlow: 0,
            pubSolnHash: hash,
            privSolnA: 1,
            privSolnB: 2,
            privSolnC: 3,
            privSolnD: 4,
            privSolnE: 5,
            privSalt: salt,
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(hash)));
        assert(Fr.eq(Fr.e(witness[2]), Fr.e(1)));
    });

    it('Should properly validate partially correct guess', async () => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        const poseidon = await buildPoseidon();
        const salt = 1234;
        const hash = poseidon.F.toString(poseidon([salt, 1, 2, 3, 4, 5]));

        const INPUT = {
            pubGuessA: 1,
            pubGuessB: 2,
            pubGuessC: 3,
            pubGuessD: 5,
            pubGuessE: 4,
            pubNumHit: 3,
            pubNumBlow: 2,
            pubSolnHash: hash,
            privSolnA: 1,
            privSolnB: 2,
            privSolnC: 3,
            privSolnD: 4,
            privSolnE: 5,
            privSalt: salt,
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(hash)));
        assert(Fr.eq(Fr.e(witness[2]), Fr.e(1)));
    });

    it('Should fail if hits and blows are incorrect', async () => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        const poseidon = await buildPoseidon();
        const salt = 1234;
        const hash = poseidon.F.toString(poseidon([salt, 1, 2, 3, 4, 5]));

        const INPUT = {
            pubGuessA: 1,
            pubGuessB: 2,
            pubGuessC: 3,
            pubGuessD: 5,
            pubGuessE: 4,
            pubNumHit: 5,
            pubNumBlow: 0,
            pubSolnHash: hash,
            privSolnA: 1,
            privSolnB: 2,
            privSolnC: 3,
            privSolnD: 4,
            privSolnE: 5,
            privSalt: salt,
        }

        expect(circuit.calculateWitness(INPUT, true)).to.be.revertedWith(Error);
    });

    it('Should fail if solution hash is incorrect', async () => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");

        const salt = 1234;
        const hash = 123123123123123123;

        const INPUT = {
            pubGuessA: 1,
            pubGuessB: 2,
            pubGuessC: 3,
            pubGuessD: 4,
            pubGuessE: 5,
            pubNumHit: 5,
            pubNumBlow: 0,
            pubSolnHash: hash,
            privSolnA: 1,
            privSolnB: 2,
            privSolnC: 3,
            privSolnD: 4,
            privSolnE: 5,
            privSalt: salt,
        }

        expect(circuit.calculateWitness(INPUT, true)).to.be.revertedWith(Error);
    });
});