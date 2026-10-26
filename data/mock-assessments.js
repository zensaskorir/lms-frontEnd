
export const assessments = [
    {
        id: 601,
        courseId: 1,
        title: "HTML and Web Fundamentals Quiz",
        description:
            "Test your understanding of HTML, CSS and JavaScript.",
        durationMinutes: 10,
        passMark: 60,
        questions: [
            {
                id: 1,
                question: "What is the main purpose of HTML?",
                options: [
                    "To store data in a database",
                    "To structure web page content",
                    "To manage a web server",
                    "To encrypt network traffic"
                ],
                correctAnswer: 1,
                explanation:
                    "HTML defines the structure and meaning of web page content."
            },
            {
                id: 2,
                question: "Which technology primarily styles web pages?",
                options: [
                    "SQL",
                    "Python",
                    "CSS",
                    "PHP"
                ],
                correctAnswer: 2,
                explanation:
                    "CSS controls the presentation and visual layout of web pages."
            },
            {
                id: 3,
                question: "Which keyword declares a block-scoped variable that can be reassigned?",
                options: [
                    "const",
                    "let",
                    "class",
                    "import"
                ],
                correctAnswer: 1,
                explanation:
                    "The let keyword declares a block-scoped variable that can be reassigned."
            }
        ]
    },
    {
        id: 602,
        courseId: 2,
        title: "Database Fundamentals Quiz",
        description:
            "Review relational databases, keys and SQL.",
        durationMinutes: 10,
        passMark: 60,
        questions: [
            {
                id: 1,
                question: "What uniquely identifies a row in a relational table?",
                options: [
                    "Foreign key",
                    "Primary key",
                    "Database name",
                    "Table heading"
                ],
                correctAnswer: 1,
                explanation:
                    "A primary key uniquely identifies each row in a table."
            },
            {
                id: 2,
                question: "Which SQL command retrieves data?",
                options: [
                    "SELECT",
                    "INSERT",
                    "UPDATE",
                    "DELETE"
                ],
                correctAnswer: 0,
                explanation:
                    "SELECT retrieves data from one or more database tables."
            },
            {
                id: 3,
                question: "What is the purpose of a foreign key?",
                options: [
                    "To encrypt all database records",
                    "To rename a database",
                    "To relate records between tables",
                    "To sort every table automatically"
                ],
                correctAnswer: 2,
                explanation:
                    "A foreign key establishes a relationship with a referenced key in another table or the same table."
            }
        ]
    }
];
