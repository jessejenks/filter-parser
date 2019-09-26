function interpretParseTree(tree, post) {
    if (tree === undefined) return true;

    let l, r;
    switch(tree.type) {
        case "boolean-expression":
            return interpretParseTree(tree.expression, post);

        case "disjunction":
            return interpretParseTree(tree.left, post) || interpretParseTree(tree.right, post);

        case "conjunction":
            return interpretParseTree(tree.left, post) && interpretParseTree(tree.right, post);

        case "negation":
            return !interpretParseTree(tree.expression, post);

        case "boolean-literal":
            return tree.token.symbol === "true";

        case "date-comparison":
            l = interpretParseTree(tree.left, post);
            r = interpretParseTree(tree.right, post);

            switch(tree.operation.symbol) {
                case "before":
                case "<":
                    return l < r;

                case "after":
                case ">":
                    return l > r;

                case "<=":
                    return l <= r;

                case ">=":
                    return l >= r;

                case "is":
                case "=":
                    return l.getTime() === r.getTime();
            }
        case "number-comparison":
            l = interpretParseTree(tree.left, post);
            r = interpretParseTree(tree.right, post);

            switch(tree.operation.symbol) {
                case "<":
                    return l < r;

                case ">":
                    return l > r;

                case "<=":
                    return l <= r;

                case ">=":
                    return l >= r;

                case "=":
                    return l === r;
            }

        case "date-value":
        case "number-value":
            return interpretParseTree(tree.token, post);

        case "date-variable":
            switch (tree.symbol) {
                case "$DATE":
                    return convertDateLiteral(post.date);
                case "$TODAY":
                    return getToday();
                case "$YESTERDAY":
                    return getYesterday();
                default:
                    return truncateDateToDay(new Date());
            }

        case "number-variable":
            return post.numWords;

        case "date-literal":
            return convertDateLiteral(tree.symbol);

        case "number-literal":
            return convertNumberLiteral(tree.symbol);

        case "tag":
            switch(tree.token.type) {
                case "tag":
                    return post.tags.includes(tree.token.symbol);
                case "tag-literal":
                    return post.tags.includes(tree.token.symbol.slice(1,-1).trim())
                case "unknown-tag-literal":
                    // presumably I could just check the post anyway
                    // but hopefully the tokenizer and the posts agree
                    return false;
            }

        default:
            console.log('?', tree);
            return false;
    }
}

function getToday() {
    const d = new Date();
    return truncateDateToDay(d);
}

function getYesterday() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return truncateDateToDay(d);
}

function truncateDateToDay(d) {
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
}

function convertDateLiteral(datestring) {
    const dateSplit = datestring.split(/-|\//);
    return new Date([dateSplit[2], dateSplit[0], dateSplit[1]]);
}

function convertNumberLiteral(numberstring) {
    return parseInt(numberstring);
}