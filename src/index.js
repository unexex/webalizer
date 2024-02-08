/* dependencies */
import binaryen from "binaryen";
var cs = require("@alexaltea/capstone-js/dist/capstone.min.js");
var ks = require("keystonejs/dist/keystone.min.js");

/* core */
import {init, omit, finish} from "./omitter.js";

/* Binary -> WebAssembly */
export default function webalizer(buffer, offset, arch){
    /* Convert architecture to capstone constants */
    var arch1, mode1, arch2, mode2;
    if (arch === "x86"){
        arch1 = cs.ARCH_X86;
        mode1 = cs.MODE_32;

        arch2 = ks.ARCH_X86;
        mode2 = ks.MODE_32;
    } else if (arch === "x64"){
        arch1 = cs.ARCH_X86;
        mode1 = cs.MODE_64;

        arch2 = ks.ARCH_X86;
        mode2 = ks.MODE_64;
    } else if (arch === "arm"){
        arch1 = cs.ARCH_ARM;
        mode1 = cs.MODE_ARM;

        arch2 = ks.ARCH_ARM;
        mode2 = ks.MODE_ARM;
    } else if (arch === "arm64"){
        arch1 = cs.ARCH_ARM64;
        mode1 = cs.MODE_ARM;

        arch2 = ks.ARCH_ARM64;
        mode2 = ks.MODE_ARM;
    }

    /* Disassemble */
    /** If we are provided Assembly compile */
    if (typeof buffer === "string"){
        var ks1 = new ks.Keystone(arch2, mode2);
        buffer = ks1.asm(buffer);
        ks1.close();
    }
    var d = new cs.Capstone(arch1, mode1);
    var instructions = d.disasm(buffer, offset);

    /* Begin compilation */
    const module = new binaryen.Module();

    init(module); // adds initializers 
    module.addFunction("main", binaryen.none, binaryen.none, binaryen.none, 
        module.block(null, instructions.map(function (instr) {
            console.log("0x%s:\t%s\t%s",
                instr.address.toString(16),
                instr.mnemonic,
                instr.op_str
            );
            return omit(instr, module);
        }
    )));
    finish(module); // adds exports

    /* clean */
    d.close(); // close capstone to 

    /* Validate and optimize */
    try {
        module.validate();
        module.optimize();
    } catch (e){
        console.warn("Generated code may be faulty, failed to validate and optimize: " + e); // warn user, and provide error
    }

    return module;
}