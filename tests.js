function tokenizerTest() {
    const myTokenizer = new Tokenizer(["nice", "cool", "ok", "wow", "neat", "computer science"]);
    const tests = [
        '0 < 2',
        '0 < 2 and not cool or ok',
        '0 < 2 and not (cool or ok)',
        '"computer science" and $DATE before 09-01-2019',
        'ok and $NUM_WORDS is 500',

        'ok and unknown and neat',
        '0000 < 2',
    ];

    const expected = [
        [
            {type: 'number-literal', spaceBefore: null, symbol: '0'},
            {type: 'binary-predicate', spaceBefore: ' ', symbol: '<'},
            {type: 'number-literal', spaceBefore: ' ', symbol: '2'}
        ],
        [
            {type: 'number-literal', spaceBefore: null, symbol: '0'},
            {type: 'binary-predicate', spaceBefore: ' ', symbol: '<'},
            {type: 'number-literal', spaceBefore: ' ', symbol: '2'},
            {type: 'binary-connective', spaceBefore: ' ', symbol: 'and'},
            {type: 'negation', spaceBefore: ' ', symbol: 'not'},
            {type: 'tag', spaceBefore: ' ', symbol: 'cool'},
            {type: 'binary-connective', spaceBefore: ' ', symbol: 'or'},
            {type: 'tag', spaceBefore: ' ', symbol: 'ok'},
        ],
        [
            {type: 'number-literal', spaceBefore: null, symbol: '0'},
            {type: 'binary-predicate', spaceBefore: ' ', symbol: '<'},
            {type: 'number-literal', spaceBefore: ' ', symbol: '2'},
            {type: 'binary-connective', spaceBefore: ' ', symbol: 'and'},
            {type: 'negation', spaceBefore: ' ', symbol: 'not'},
            {type: 'left-paren', spaceBefore: ' ', symbol: '('},
            {type: 'tag', spaceBefore: null, symbol: 'cool'},
            {type: 'binary-connective', spaceBefore: ' ', symbol: 'or'},
            {type: 'tag', spaceBefore: ' ', symbol: 'ok'},
            {type: 'right-paren', spaceBefore: null, symbol: ')'},
        ],
        [
            {type: 'tag-literal', spaceBefore: null, symbol: '"computer science"'},
            {type: 'binary-connective', spaceBefore: ' ', symbol: 'and'},
            {type: 'date-variable', spaceBefore: ' ', symbol: '$DATE'},
            {type: 'binary-predicate', spaceBefore: ' ', symbol: 'before'},
            {type: 'date-literal', spaceBefore: ' ', symbol: '09-01-2019'},
        ],
        [
            {type: 'tag', spaceBefore: null, symbol: 'ok'},
            {type: 'binary-connective', spaceBefore: ' ', symbol: 'and'},
            {type: 'number-variable', spaceBefore: ' ', symbol: '$NUM_WORDS'},
            {type: 'binary-predicate', spaceBefore: ' ', symbol: 'is'},
            {type: 'number-literal', spaceBefore: ' ', symbol: '500'},
        ],
        [
            {type: 'tag', spaceBefore: null, symbol: 'ok'},
            {type: 'binary-connective', spaceBefore: ' ', symbol: 'and'},
            {type: 'unknown', spaceBefore: ' ', symbol: 'unknown'},
            {type: 'binary-connective', spaceBefore: ' ', symbol: 'and'},
            {type: 'tag', spaceBefore: ' ', symbol: 'neat'},
        ],
        [
            {type: 'number-literal', spaceBefore: null, symbol: '0'},
            {type: 'number-literal', spaceBefore: null, symbol: '0'},
            {type: 'number-literal', spaceBefore: null, symbol: '0'},
            {type: 'number-literal', spaceBefore: null, symbol: '0'},
            {type: 'binary-predicate', spaceBefore: ' ', symbol: '<'},
            {type: 'number-literal', spaceBefore: ' ', symbol: '2'},
        ]
    ]

    let test;
    for (let i = 0; i<tests.length; i++) {
        test = tests[i];
        console.log(`testing on '${test}'`);
        myTokenizer.setInput(test);

        let count = 0;
        let passed = false;
        while(count < 50 && !myTokenizer.eof()) {
            passed = assertEqualObj(myTokenizer.next(), expected[i][count])
            count ++;
        }
        if (passed) {
            logSuccess()
        }
    }

}

function parserTest() {
    const myParser = new FilterParser(["nice", "cool", "ok", "wow", "neat"]);

    const tests = [
        '0 < 2',
        'nice and cool',
        'nice and cool and wow',
        'nice and (cool and wow)',
        'nice and "cool and wow"',
    ];

    const expected = [
        {
            type: 'boolean-expression',
            leftParen: null,
            rightParen: null,
            expression: {
                type: 'number-comparison',
                left: {
                    type: 'number-value',
                    token: {
                        type: 'number-literal',
                        spaceBefore: null,
                        symbol: '0',
                    }
                },
                operation: {
                    type: 'binary-predicate',
                    spaceBefore: ' ',
                    symbol: '<',
                },
                right: {
                    type: 'number-value',
                    token: {
                        type: 'number-literal',
                        spaceBefore: ' ',
                        symbol: '2'
                    }
                }
            }
        },
        {
            type: 'boolean-expression',
            leftParen: null,
            rightParen: null,
            expression: {
                type: 'conjunction',
                left: {
                    type: 'tag',
                    token: {
                        type: 'tag',
                        spaceBefore: null,
                        symbol: 'nice'
                    }
                },
                operation: {
                    type: 'binary-connective',
                    spaceBefore: ' ',
                    symbol: 'and'
                },
                right: {
                    type: 'tag',
                    token: {
                        type: 'tag',
                        spaceBefore: ' ',
                        symbol: 'cool'
                    }
                }
            }
        },
        {
            type: 'boolean-expression',
            leftParen: null,
            rightParen: null,
            expression: {
                type: 'conjunction',
                left: {
                    type: 'conjunction',
                    left: {
                        type: 'tag',
                        token: {
                            type: 'tag',
                            spaceBefore: null,
                            symbol: 'nice'
                        }
                    },
                    operation: {
                        type: 'binary-connective',
                        spaceBefore: ' ',
                        symbol: 'and'
                    },
                    right: {
                        type: 'tag',
                        token: {
                            type: 'tag',
                            spaceBefore: ' ',
                            symbol: 'cool'
                        }
                    }
                },
                operation: {
                    type: 'binary-connective',
                    spaceBefore: ' ',
                    symbol: 'and'
                },
                right: {
                    type: 'tag',
                    token: {
                        type: 'tag',
                        spaceBefore: ' ',
                        symbol: 'wow'
                    }
                }
            }
        },
        {
            type: 'boolean-expression',
            leftParen: null,
            rightParen: null,
            expression: {
                type: 'conjunction',
                left: {
                    type: 'tag',
                    token: {
                        type: 'tag',
                        spaceBefore: null,
                        symbol: 'nice'
                    }
                },
                operation: {
                    type: 'binary-connective',
                    spaceBefore: ' ',
                    symbol: 'and'
                },
                right: {
                    type: 'boolean-expression',
                    leftParen: {
                        type: 'left-paren',
                        spaceBefore: ' ',
                        symbol: '('
                    },
                    rightParen: {
                        type: 'right-paren',
                        spaceBefore: null,
                        symbol: ')'
                    },
                    expression: {
                        type: 'boolean-expression',
                        leftParen: null,
                        rightParen: null,
                        expression: {
                            type: 'conjunction',
                            left: {
                                type: 'tag',
                                token: {
                                    type: 'tag',
                                    spaceBefore: null,
                                    symbol: 'cool'
                                }
                            },
                            operation: {
                                type: 'binary-connective',
                                spaceBefore: ' ',
                                symbol: 'and'
                            },
                            right: {
                                type: 'tag',
                                token: {
                                    type: 'tag',
                                    spaceBefore: ' ',
                                    symbol: 'wow'
                                }
                            }
                        }
                    }
                },
            }
        },
        {
            type: 'boolean-expression',
            leftParen: null,
            rightParen: null,
            expression: {
                type: 'conjunction',
                left: {
                    type: 'tag',
                    token: {
                        type: 'tag',
                        spaceBefore: null,
                        symbol: 'nice'
                    }
                },
                operation: {
                    type: 'binary-connective',
                    spaceBefore: ' ',
                    symbol: 'and'
                },
                right: {
                    type: 'tag',
                    token: {
                        type: 'tag-literal',
                        spaceBefore: ' ',
                        symbol: '"cool and wow"'
                    }
                }
            }
        },
    ];

    let test;
    for (let i = 0; i<tests.length; i++) {
        test = tests[i];
        console.log(`testing on '${test}'`);
        myParser.setInput(test);

        passed = assertEqualObj(myParser.parse(), expected[i])
        if (passed) {
            logSuccess()
        }
    }
}






function assertEqualObj(actual, expected) {
    const areTheSame = JSON.stringify(actual) === JSON.stringify(expected);
    if (areTheSame) {
        return true;
    } else {
        logFailure(`${JSON.stringify(actual, null, 4)} !== ${JSON.stringify(expected, null, 4)}`);
        return false
    }
}

function logSuccess(msg="\n", ...args) {
    console.log(
        `%cPASS ${msg}`,
        'color: green; padding: 1em; font-size: 8px;',
        ...args
    )
}

function logFailure(msg="", ...args) {
    console.log(
        `%cFAIL: ${msg}`,
        'color: red; background-color: black; padding: 1em;',
        ...args
    )
}