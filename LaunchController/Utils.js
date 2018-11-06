export function getResetMessage() {
   return Uint8Array.from([184, 0, 0]);
}

export function getSetTemplateMessage() {
   var template = 0x08;
   return Uint8Array.from([0xF0, 0x00, 0x20, 0x29, 0x02, 0x0A, 0x77, template, 0xF7]);
   
   //      SysexMessage setTemplateMsg = new SysexMessage(msgContent, msgContent.length);
}