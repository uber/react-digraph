/*
Every module in this folder is a grouping of handler functions by editor.

When a handler module getXXXHandlers(bwdlEditable) method is called, the bwdlEditable instance gets
extended with all the handler functions, and returned as it is.

The editors are unaware of this, so they do get the bwdlEditable object, but only call the handlers methods.
*/
