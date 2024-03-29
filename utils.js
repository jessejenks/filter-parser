/* Tokenizer Util */
function isValidDate(chars) {
    const dateSplit = chars.split(/-|\//);
    return !isNaN(new Date([dateSplit[2], dateSplit[0], dateSplit[1]]).getTime());
}

/* Parser Utils */

function isDisjunctionToken(token) {
    return isOfTypeAndSymbol('binary-connective', 'or', token);
}

function isConjunctionToken(token) {
    return isOfTypeAndSymbol('binary-connective', 'and', token);
}

function isNegationToken(token) {
    return isOfType('negation', token);
}

function isLeftParenToken(token) {
    return isOfType('left-paren', token);
}

function isRightParenToken(token) {
    return isOfType('right-paren', token);
}

function isBooleanLiteral(token) {
    return isOfType('boolean-literal', token);
}

function isTagToken(token) {
    return (
        isOfType('tag', token)
        || isOfType('tag-literal', token)
        || isOfType('unknown-tag-literal', token)
    );
}

function isEqualitySymbolToken(token) {
    return isOfTypeAndSymbolIsOneOf(
        'binary-predicate',
        ["is", "="],
        token);
}

function isDateEqualitySymbolToken(token) {
    return isEqualitySymbolToken(token);
}

function isDateInequalitySymbolToken(token) {
    return isOfTypeAndSymbolIsOneOf(
        'binary-predicate',
        ["before", "after"],
        token) || isInequalitySymbolToken(token);
}

function isNumberEqualitySymbolToken(token) {
    return isEqualitySymbolToken(token);
}

function isNumberInequalitySymbolToken(token) {
    return isInequalitySymbolToken(token);
}

function isInequalitySymbolToken(token) {
    return isOfTypeAndSymbolIsOneOf(
        'binary-predicate',
        ["<", "<=", ">", ">="],
        token);
}

function isDateVariableToken(token) {
    return isOfType('date-variable', token);
}

function isDateLiteralToken(token) {
    return isOfType('date-literal', token) || isOfType('invalid-date-literal', token)
}

function isNumberVariableToken(token) {
    return isOfType('number-variable', token);
}

function isNumberLiteralToken(token) {
    return isOfType('number-literal', token);
}

function isWhiteSpaceToken(token) {
    return isOfType('whitespace', token);
}

function isOfTypeAndSymbolIsOneOf(type, symbols, token) {
    return isOfType(type, token) && symbols.includes(token.symbol);
}

function isOfTypeAndSymbol(type, symbol, token) {
    return isOfType(type, token) && symbol === token.symbol;
}

function isOfType(type, token) {
    return (token && token.type === type) || false;
}