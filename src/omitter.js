/*
** ommitter.js
** Visits for instructions and provides initializers and finalizers.
** Aarav Sethi
*/

import binaryen from "binaryen";
import instructions from "./instructions.js";

export function omit(instr, module, arch, inturrupt){
    if (instr.mnemonic in instructions){
        return instructions[instr.mnemonic](instr, module, inturrupt);
    }
    console.warn("Instruction '" + instr.mnemonic + "' not implemented.");
    return module.unreachable();
}
export function init(module, arch, inturrupt){
    if (inturrupt) module.addFunctionImport("inturrupt", "inturrupt", "inturrupt", binaryen.i32, binaryen.none);

    /* stack */
    module.setMemory(1, 1, false, false, false, false, "memory");
    module.addGlobal("sp", binaryen.i32, true, module.i32.const(0));

    /* define registers */
    module.addGlobal("eax", binaryen.i32, true, module.i32.const(0));
    module.addGlobal("ebx", binaryen.i32, true, module.i32.const(0));
    module.addGlobal("ecx", binaryen.i32, true, module.i32.const(0));
    module.addGlobal("edx", binaryen.i32, true, module.i32.const(0));

    /* useful functions */
}
export function finish(module){
    module.addFunctionExport("main", "main");
}
export function finishFuncs(module){
    return [module.return(module.i32.const(0))]; // TODO: return eax
}