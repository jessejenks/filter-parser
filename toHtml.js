function parseTreeToHtml(tree, lParenCount=0, rParenCount=0) {
    if (tree === undefined) return "";

    switch(tree.type) {
        case "boolean-expression":
            let lp = "";
            let rp = "";
            let lPCount = lParenCount;
            let rPCount = rParenCount;

            // for user entered parens
            if (tree.leftParen !== null) {
                lp = getSpanNoParens(tree.leftParen);
                if (lPCount > 0) {
                    lPCount--;
                }
            }
            if (tree.rightParen !== null) {
                rp = getSpanNoParens(tree.rightParen);
                if (rPCount > 0) {
                    rPCount--;
                }
            }
            return `${lp}${parseTreeToHtml(tree.expression, lPCount, rPCount)}${rp}`;

        case "disjunction":
        case "conjunction":
        case "date-comparison":
        case "number-comparison":
            return `${
                parseTreeToHtml(tree.left, lParenCount+1, 0)
            }${
                parseTreeToHtml(tree.operation)
            }${
                parseTreeToHtml(tree.right, 0, rParenCount+1)
            }`;
        
        case "negation":
            return `${
                getSpan(tree.operation, lParenCount+1, 0)
            }${
                parseTreeToHtml(tree.expression, 0, rParenCount+1)
            }`;

        case "date-value":
        case "number-value":
            return parseTreeToHtml(tree.token, lParenCount, rParenCount);

        case "date-variable":
        case "number-variable":
            return variableToken(tree, lParenCount, rParenCount);
        
        case "tag":
        case "boolean-literal":
            return getSpan(tree.token, lParenCount, rParenCount);

        default:
            return getSpan(tree, lParenCount, rParenCount);
    }
}

function dateVariableToken(token) {
    return variableToken(token);
}

function numberVariableToken(token) {
    return variableToken(token);
}

function variableToken(token, l, r) {
    const ws = getWhiteSpaceSpan(token);
    const lp = getLParens(l);
    const rp = getRParens(r);
    return `${ws}${lp}${
        spanWithClass(token.symbol.slice(0,1), 'begin-variable')
    }${
        spanWithClass(token.symbol.slice(1), 'variable')
    }${rp}`
}

function getSpan(token, l, r) {
    const ws = getWhiteSpaceSpan(token);
    const lp = getLParens(l);
    const rp = getRParens(r);
    return `${ws}${lp}${spanWithClass(token.symbol, token.type)}${rp}`;
}

function getSpanNoParens(token) {
    const ws = getWhiteSpaceSpan(token);
    return `${ws}${spanWithClass(token.symbol, token.type)}`;
}

function getWhiteSpaceSpan(token) {
    return token.spaceBefore === null? (
        ""
    ) : (
        spanWithClass(token.spaceBefore, 'whitespace')
    );
}

const getLParens = n => [...Array(n).keys()].map(k => (
    `<span class="floating-paren" style="margin-left: -${6 + 4*k}px;">(</span>`
)).join('');

const getRParens = n => [...Array(n).keys()].map(k => (
    `<span class="floating-paren" style="margin-right: -${4*k}px;">)</span>`
)).join('');

function spanWithClass(text, className) {
    return `<span class="${className}">${text}</span>`
}