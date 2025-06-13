function isValidNote(note) {
    if (!note || typeof note.content !== 'string') return false;
    return note.content.trim() !== '';
}
module.exports = { isValidNote };

