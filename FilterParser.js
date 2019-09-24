class FilterParser {
    constructor(tags) {
        this.tokenizer = new Tokenizer(tags);
        this.errors = [];
    }

    setInput(input) {
        this.tokenizer.setInput(input);
    }

    getTokenSpans() {
        return this.tokenizer.getTokenSpans();
    }

    parse() {
        return this.booleanExpression();
    }

    booleanExpression() {
        const disjunction = this.disjunction();
        if (disjunction !== undefined) {
            return {
                type: 'boolean-expression',
                leftParen: null, rightParen: null,
                expression: disjunction,
            }
        }
    }

    disjunction() {
        let left = this.conjunction();

        let lookahead = this.tokenizer.peek();

        let operation, right;
        while (this.match(isDisjunctionToken(lookahead))) {

            operation = lookahead;

            right = this.conjunction();

            if (left !== undefined && right !== undefined) {
                left = {
                    type: 'disjunction',
                    left, operation, right,
                }
            }

            lookahead = this.tokenizer.peek();
        }

        return left;
    }    

    conjunction() {
        let left = this.negation();

        let lookahead = this.tokenizer.peek();

        let operation, right;
        while (this.match(isConjunctionToken(lookahead))) {


            operation = lookahead;

            right = this.negation();

            if (left !== undefined && right !== undefined) {
                left = {
                    type: 'conjunction',
                    left, operation, right,
                }
            }

            lookahead = this.tokenizer.peek();
        }

        return left;
    }

    negation() {
        let lookahead = this.tokenizer.peek();

        let operation, expression;
        if (this.match(isNegationToken(lookahead))) {

            operation = lookahead;

            expression = this.negation();

            if (expression !== undefined) {
                return {
                    type: 'negation',
                    operation, expression
                }
            }
        }

        if (this.match(isBooleanLiteral(lookahead))) {
            return {
                type: 'boolean-literal',
                token: lookahead,
            }
        }

        if (this.match(isTagToken(lookahead))) {
            return {
                type: 'tag',
                token: lookahead,
            }
        }

        expression = this.comparison();
        if (expression !== undefined) {
            return expression;
        }
        
        if (this.match(isLeftParenToken(lookahead))) {
            const leftParen = lookahead;
            expression = this.booleanExpression();

            lookahead = this.tokenizer.peek();
            if (!this.match(isRightParenToken(lookahead))) {
                this.croak('Expecting right parenthesis')
            }

            const rightParen = lookahead;

            if (expression !== undefined) {
                return {
                    type: 'boolean-expression',
                    leftParen, rightParen,
                    expression
                }
            }
        }
    }

    /* Comparison              -> DateComparison
                                | NumberComparison ; */
    comparison() {
        let comparison = this.dateComparison();
        if (comparison !== undefined) {
            return comparison;
        }

        comparison = this.numberComparison();
        if (comparison !== undefined) {
            return comparison ;
        }
    }

    dateComparison() {
        const date = this.dateValue();
        let lookahead = this.tokenizer.peek();

        if (this.match(
            isDateEqualitySymbolToken(lookahead)
            || isDateInequalitySymbolToken(lookahead))
        ) {
            const operation = lookahead;
            const otherDate = this.dateValue();

            if (otherDate !== undefined) {
                return {
                    type: 'date-comparison',
                    left: date,
                    operation,
                    right: otherDate,
                }
            }

            this.croak(`Expected date following "${lookahead.symbol}"`);
        }
    }

    numberComparison() {
        const number = this.numberValue();
        let lookahead = this.tokenizer.peek();

        if (this.match(
            isNumberEqualitySymbolToken(lookahead)
            || isNumberInequalitySymbolToken(lookahead))
        ) {
            const operation = lookahead;
            const otherNumber = this.numberValue();

            if (otherNumber !== undefined) {
                return {
                    type: 'number-comparison',
                    left: number,
                    operation,
                    right: otherNumber,
                }
            }

            this.croak(`Expected number following "${lookahead.symbol}"`);
        }
    }    

    /* DateValue               -> DateVariable
                                | DateLiteral ; */
    dateValue() {
        let lookahead = this.tokenizer.peek();
        if (this.match(isDateVariableToken(lookahead) || isDateLiteralToken(lookahead))) {
            return {
                type: 'date-value',
                token: lookahead
            }
        }
    }
    
    /* NumberValue            -> NumberVariable
                                | NumberLiteral ; */
    numberValue() {
        let lookahead = this.tokenizer.peek();
        if (this.match(isNumberVariableToken(lookahead) || isNumberLiteralToken(lookahead))) {
            return {
                type: 'number-value',
                token: lookahead
            }
        }
    }

    match(bool) {
        if (bool === true) {
            this.consume();
        }

        return bool;
    }

    consume() {
        if (this.tokenizer !== null) {// && !this.tokenizer.eof()) {
            this.tokenizer.next();
        }
    }

    croak(message) {
        throw new Error(message);

        this.errors.push({
            index: this.tokenizer.index,
            message: message,
        });
    }
}