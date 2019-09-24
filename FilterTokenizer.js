const VARIABLES = {
    DATE_VARIABLES: ["DATE", "TODAY", "YESTERDAY"],
    NUMBER_VARIABLES: ["NUM_WORDS"],
}
class Tokenizer {
    constructor(tags) {
        this.input = "";
        this.index = 0;

        this.currentToken = null;

        this.tags = tags;
    }

    setInput(input) {
        this.input = input;
        this.reset();
    }

    reset() {
        this.currentToken = null;
        this.index = 0;
    }

    peek() {
        if (this.currentToken === null) {
            this.currentToken = this.getNext();
        }

        return this.currentToken;
    }

    next() {
        const token = this.peek();
        this.currentToken = null;
        return token;
    }

    eof() {
        return this.input.charAt(this.index) === "";
    }

    getNext() {
        const spaceBefore = this.readWhitespace();

        let chars = this.readString(spaceBefore);
        if (chars !== null) {
            return chars
        }

        chars = this.readDateLiteral();
        if (chars !== null) {
            return this.tokenOfType(isValidDate(chars)? 'date-literal' : 'invalid-date-literal', chars, spaceBefore);
        }

        chars = this.readNumberLiteral();
        if (chars !== null) {
            return this.tokenOfType('number-literal', chars, spaceBefore);
        }

        chars = this.readLeftParen();
        if (chars !== null) {
            return this.tokenOfType('left-paren', chars, spaceBefore);
        }

        chars = this.readRightParen();
        if (chars !== null) {
            return this.tokenOfType('right-paren', chars, spaceBefore);
        }

        chars = this.readPunctuation()
        if (chars !== null) {
            return this.tokenOfType('punctuation', chars, spaceBefore);
        }

        chars = this.readBinaryPredicateSymbol();
        if (chars !== null) {
            return this.tokenOfType('binary-predicate', chars, spaceBefore);
        }

        chars = this.readWord(spaceBefore);
        if (chars !== null) {
            return chars
        }

        chars = this.readWhileRegEx(/[^\s]/);
        if (chars !== null) {
            return this.tokenOfType('unknown', chars, spaceBefore);
        }

        return this.tokenOfType('whitespace', spaceBefore, null);
    }

    readWhitespace() {
        return this.readWhileRegEx(/\s/);
    }

    readString(spaceBefore) {
        const startQuote = this.readOneCharacterIfRegEx(/"/);
        if (startQuote === null) {
            return null;
        }

        const rest = this.readWhileRegEx(/[^"]/);
        if (rest === null) {
            return this.tokenOfType('punctuation', startQuote, spaceBefore);
        }

        let endQuote = this.readOneCharacterIfRegEx(/"/);
        if (endQuote === null) {
            endQuote = "";
        }

        return this.tokenOfType('tag-literal', startQuote+rest+endQuote, spaceBefore);
    }

    readDateLiteral() {
        const maybeDate = this.input.slice(this.index, this.index + 10);
        // MM-DD-YYYY format
        // if (/^(0[1-9]|1[0-2])-\d[1-9]-\d{4}$/g.test(maybeDate)) {
        if (/^\d{2}-\d{2}-\d{4}$/g.test(maybeDate)) {
            this.index += 10;
            return maybeDate;
        }

        return null;
    }


    // 0 or [1-9][0-9]*
    readNumberLiteral() {
        let number = this.readOneCharacterIfRegEx(/0/);
        if (number !== null) {
            return number;
        }

        number = this.readOneCharacterIfRegEx(/[1-9]/);
        if (number === null) {
            return null
        }

        const restOfNumber = this.readWhileRegEx(/[0-9]/);
        if (restOfNumber === null) {
            return number;
        }

        return number + restOfNumber;
    }

    readLeftParen() {
        return this.readOneCharacterIfRegEx(/\(/);
    }

    readRightParen() {
        return this.readOneCharacterIfRegEx(/\)/);
    }

    readPunctuation() {
        return this.readWhileRegEx(/[\.,:;]/);
    }

    // basically matches (=|(<|>)=?)
    readBinaryPredicateSymbol() {
        let chars = this.readOneCharacterIfRegEx(/=/);
        if (chars !== null) {
            return chars;
        }

        chars = this.readOneCharacterIfRegEx(/<|>/);
        if (chars !== null) {
            const equals = this.readOneCharacterIfRegEx(/=/);
            if (equals !== null) {
                return chars + equals;
            }

            return chars;
        }

        return null;
    }

    readWord(spaceBefore) {
        let dollar = this.readOneCharacterIfRegEx(/\$/);
        let chars = "";

        if (dollar !== null) {
            // either punctuation or variable or tag or unknown
            const rest = this.readText();
            if (rest === null) {
                return this.tokenOfType('punctuation', dollar, spaceBefore);
            }

            chars = dollar + rest;
            if (VARIABLES.DATE_VARIABLES.includes(rest)) {
                return this.tokenOfType('date-variable', chars, spaceBefore);

            } else if (VARIABLES.NUMBER_VARIABLES.includes(rest)) {
                return this.tokenOfType('number-variable', chars, spaceBefore);

            }

            return this.tokenOfType('unknown', chars, spaceBefore);
        }


        chars = this.readText();
        if (chars !== null) {
            if (/^(and|or)$/i.test(chars)) {
                return this.tokenOfType('binary-connective', chars, spaceBefore);
            }

            if (/^not$/i.test(chars)) {
                return this.tokenOfType('negation', chars, spaceBefore);
            }

            if (/^(is|before|after)$/i.test(chars)) {
                return this.tokenOfType('binary-predicate', chars, spaceBefore);
            }

            if (/^(true|false)$/i.test(chars)) {
                return this.tokenOfType('boolean-literal', chars, spaceBefore);
            }

            if (this.tags.includes(chars)) {
                return this.tokenOfType('tag', chars, spaceBefore);
            }

            return this.tokenOfType('unknown', chars, spaceBefore);
        }

        return null;
    }

    tokenOfType(type, chars, spaceBefore) {
        return {
            type: type,
            spaceBefore: spaceBefore,
            symbol: chars
        };
    }

    readText() {
        return this.readWhileRegEx(/[a-zA-Z_\-]/);
    }

    readOneCharacterIfRegEx(re) {
        let output = null;
        if (!this.eof() && re.test(this.peekChar())) {
            output = this.nextChar();
        }
        return output;
    }

    readWhileRegEx(re) {
        let output = null;
        while (!this.eof() && re.test(this.peekChar())) {
            if (output === null) {
                output = ""
            }
            output += this.nextChar();
        }
        return output;
    }

    peekChar() {
        return this.input.charAt(this.index);
    }

    nextChar() {
        const char = this.input.charAt(this.index);
        this.index++;
        return char;
    }

    getTokenSpans() {
        this.reset();
        const chunks = [];

        let currToken;
        let count = 0;
        while (count < 1000 && !this.eof()) {
            try {
                currToken = this.next();
                // debugLog(currToken)
            } catch(err) {
                console.log(err)
                // errors.push(err);
            }

            if (currToken.type === "date-variable") {
                chunks.push(dateVariableToken(currToken));
            } else if(currToken.type === "number-variable") {
                chunks.push(numberVariableToken(currToken));
            } else {
                chunks.push(getSpan(currToken))
            }
        
            count++;
        }

        return chunks.join('');
    }
}

function isValidDate(chars) {
    const dateSplit = chars.split('-');
    return !isNaN(new Date([dateSplit[2], dateSplit[0], dateSplit[1]]).getTime());
}