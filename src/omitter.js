/*
** ommitter.js
** Visits for instructions and provides initializers and finalizers.
** Aarav Sethi
*/

import binaryen from "binaryen";
import instructions from "./instructions.js";
import data from "./data.js";
import stackInit from "./stack.js";
import omitterfuncs from "./omitterfuncs.js";

export function omit(instr, module, arch, inturrupt, mem){
    if (instr.mnemonic in instructions){
        return instructions[instr.mnemonic](instr, module, inturrupt, mem);
    }
    throw new Error("Instruction not implemented: " + instr.mnemonic);
}
export function init(module, arch, inturrupt, mem){ /* before main */
    if (inturrupt) module.addFunctionImport("inturrupt", "inturrupt", "inturrupt", binaryen.i32, binaryen.none);
    stackInit(module);
    module.addGlobal("pass", binaryen.i32, 1, module.i32.const(0));
}
export function finish(module){ /* after main */
    module.addFunctionExport("main", "main");
}
export function finishFuncs(module){ /* in main */
    return [module.return(module.local.get(omitterfuncs.regNameToLocalIndex("edi"), binaryen.i32))];
}
export function initFuncs(module, arch, inturrupt){ /* in main */
    var i = 0;
    return data.registers.map(function (){
        i++;
        return module.local.set(i-1, module.i32.const(0));
    })
}