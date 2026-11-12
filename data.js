// data.js – sample college database, practice questions and quiz. Edit/add freely.

const SEED = `
CREATE TABLE departments(dept_id INTEGER PRIMARY KEY, dept_name TEXT NOT NULL, hod TEXT);
CREATE TABLE students(student_id INTEGER PRIMARY KEY, name TEXT NOT NULL, dept_id INTEGER REFERENCES departments(dept_id), year INTEGER, cgpa REAL, city TEXT);
CREATE TABLE courses(course_id INTEGER PRIMARY KEY, title TEXT NOT NULL, dept_id INTEGER REFERENCES departments(dept_id), credits INTEGER);
CREATE TABLE enrollments(student_id INTEGER REFERENCES students(student_id), course_id INTEGER REFERENCES courses(course_id), grade TEXT, semester INTEGER, PRIMARY KEY(student_id, course_id));

INSERT INTO departments VALUES (1,'Computer Science','Dr. Rao'),(2,'Electronics','Dr. Mehta'),(3,'Mechanical','Dr. Singh'),(4,'Civil','Dr. Khan');

INSERT INTO students VALUES
(1,'Aarav Sharma',1,2,8.9,'Lucknow'),(2,'Ananya Verma',1,3,9.2,'Delhi'),(3,'Rohan Gupta',2,1,7.4,'Kanpur'),
(4,'Priya Singh',1,2,8.1,'Lucknow'),(5,'Karan Mehta',3,4,6.8,'Jaipur'),(6,'Sneha Iyer',2,3,8.7,'Chennai'),
(7,'Arjun Rao',1,4,9.0,'Hyderabad'),(8,'Isha Khan',4,2,7.9,'Lucknow'),(9,'Vikram Yadav',3,1,6.5,'Varanasi'),
(10,'Neha Joshi',2,2,8.3,'Pune'),(11,'Aditya Mishra',1,1,7.7,'Lucknow'),(12,'Divya Nair',4,3,8.5,'Kochi'),
(13,'Manish Kumar',3,2,7.1,'Patna'),(14,'Simran Kaur',1,3,8.8,'Amritsar'),(15,'Rahul Dubey',4,4,6.9,'Lucknow'),
(16,'Pooja Patel',2,4,9.1,'Ahmedabad'),(17,'Amit Tiwari',1,1,7.2,'Kanpur'),(18,'Tanya Bose',2,1,8.0,'Kolkata'),
(19,'Yash Agarwal',3,3,7.6,'Agra'),(20,'Meera Reddy',4,1,8.4,'Hyderabad');

INSERT INTO courses VALUES
(101,'Database Systems',1,4),(102,'Data Structures',1,4),(103,'Operating Systems',1,3),(201,'Digital Electronics',2,4),
(202,'Signals and Systems',2,3),(301,'Thermodynamics',3,4),(302,'Machine Design',3,3),(401,'Structural Analysis',4,4);

INSERT INTO enrollments VALUES
(1,101,'A',3),(1,102,'B',3),(2,101,'A',5),(2,103,'A',5),(4,101,'B',3),(4,102,'C',3),(7,101,'A',7),(7,103,'B',7),
(11,102,'C',1),(11,101,NULL,1),(14,101,'A',5),(14,103,'B',5),(17,102,'D',1),(3,201,'B',1),(6,201,'A',5),(6,202,'A',5),
(10,202,'B',3),(16,201,'A',7),(18,201,NULL,1),(5,301,'C',7),(9,301,'F',1),(13,302,'B',3),(19,302,NULL,5),(8,401,'B',3),(12,401,'A',5);
`;

// answer: reference SQL. verify (optional): SELECT run afterwards to compare the final database state (for INSERT/UPDATE/DELETE/CREATE).
// ordered: true if row order matters.
const QUESTIONS = [
  { level:"Easy", topic:"SELECT", q:"Show the names and cities of all students.",
    hint:"List the columns after SELECT, separated by commas.", answer:"SELECT name, city FROM students;" },
  { level:"Easy", topic:"WHERE", q:"Find all details of students who live in Lucknow.",
    hint:"Use WHERE city = '...'. Text values go in single quotes.", answer:"SELECT * FROM students WHERE city = 'Lucknow';" },
  { level:"Easy", topic:"ORDER BY", q:"List name and cgpa of students with CGPA above 8.5, highest CGPA first.",
    hint:"WHERE for the filter, ORDER BY cgpa DESC for sorting.", ordered:true,
    answer:"SELECT name, cgpa FROM students WHERE cgpa > 8.5 ORDER BY cgpa DESC;" },
  { level:"Easy", topic:"LIKE", q:"Show names of students whose name starts with the letter 'A'.",
    hint:"LIKE 'A%' matches anything starting with A.", answer:"SELECT name FROM students WHERE name LIKE 'A%';" },
  { level:"Easy", topic:"NULL", q:"Show student_id and course_id of enrollments where the grade is not assigned yet.",
    hint:"NULL cannot be compared with =. Use IS NULL.", answer:"SELECT student_id, course_id FROM enrollments WHERE grade IS NULL;" },
  { level:"Medium", topic:"GROUP BY", q:"Show each dept_id and the number of students in it.",
    hint:"COUNT(*) with GROUP BY dept_id.", answer:"SELECT dept_id, COUNT(*) FROM students GROUP BY dept_id;" },
  { level:"Medium", topic:"JOIN", q:"Show each dept_name and the average CGPA of its students, rounded to 2 decimals.",
    hint:"JOIN students with departments on dept_id, then GROUP BY dept_name. ROUND(AVG(cgpa), 2).",
    answer:"SELECT d.dept_name, ROUND(AVG(s.cgpa), 2) FROM students s JOIN departments d ON s.dept_id = d.dept_id GROUP BY d.dept_name;" },
  { level:"Medium", topic:"HAVING", q:"Show dept_name of departments that have more than 4 students.",
    hint:"WHERE filters rows before grouping. HAVING filters groups after COUNT.",
    answer:"SELECT d.dept_name FROM departments d JOIN students s ON s.dept_id = d.dept_id GROUP BY d.dept_id HAVING COUNT(*) > 4;" },
  { level:"Medium", topic:"Subquery", q:"Show names of students who are not enrolled in any course.",
    hint:"NOT IN (SELECT student_id FROM enrollments). A LEFT JOIN with IS NULL also works.",
    answer:"SELECT name FROM students WHERE student_id NOT IN (SELECT student_id FROM enrollments);" },
  { level:"Medium", topic:"Subquery", q:"Show name and cgpa of the student(s) with the highest CGPA.",
    hint:"Compare cgpa with (SELECT MAX(cgpa) FROM students).",
    answer:"SELECT name, cgpa FROM students WHERE cgpa = (SELECT MAX(cgpa) FROM students);" },
  { level:"Medium", topic:"Subquery", q:"Show names of students whose CGPA is above the average CGPA of all students.",
    hint:"cgpa > (SELECT AVG(cgpa) FROM students).",
    answer:"SELECT name FROM students WHERE cgpa > (SELECT AVG(cgpa) FROM students);" },
  { level:"Hard", topic:"Multi-table JOIN", q:"Show names of students who got grade 'A' in the course 'Database Systems'.",
    hint:"Join students, enrollments and courses. Filter on c.title and e.grade.",
    answer:"SELECT s.name FROM students s JOIN enrollments e ON e.student_id = s.student_id JOIN courses c ON c.course_id = e.course_id WHERE c.title = 'Database Systems' AND e.grade = 'A';" },
  { level:"Hard", topic:"LEFT JOIN", q:"For every course show title and number of enrolled students, including courses with 0 students.",
    hint:"LEFT JOIN keeps courses with no match. COUNT(e.student_id) ignores NULLs.",
    answer:"SELECT c.title, COUNT(e.student_id) FROM courses c LEFT JOIN enrollments e ON e.course_id = c.course_id GROUP BY c.course_id;" },
  { level:"DML", topic:"INSERT", q:"Insert a new student: id 21, name 'Zara Ali', dept_id 1, year 1, cgpa 8.0, city 'Lucknow'.",
    hint:"INSERT INTO students VALUES (...) in the column order of the table.",
    answer:"INSERT INTO students VALUES (21, 'Zara Ali', 1, 1, 8.0, 'Lucknow');", verify:"SELECT * FROM students WHERE student_id = 21;" },
  { level:"DML", topic:"UPDATE", q:"Increase credits by 1 for all courses of the Computer Science department (dept_id 1).",
    hint:"UPDATE courses SET credits = credits + 1 WHERE ...",
    answer:"UPDATE courses SET credits = credits + 1 WHERE dept_id = 1;", verify:"SELECT course_id, credits FROM courses;" },
  { level:"DML", topic:"DELETE", q:"Delete all enrollments where the grade is 'F'.",
    hint:"DELETE FROM table WHERE condition. Without WHERE it deletes every row!",
    answer:"DELETE FROM enrollments WHERE grade = 'F';", verify:"SELECT COUNT(*) FROM enrollments;" },
  { level:"DDL", topic:"CREATE TABLE", q:"Create a table library with book_id INTEGER PRIMARY KEY, title TEXT, available INTEGER.",
    hint:"CREATE TABLE library (col type, col type, ...). Use exactly these names and types.",
    answer:"CREATE TABLE library (book_id INTEGER PRIMARY KEY, title TEXT, available INTEGER);",
    verify:"SELECT name, type, pk FROM pragma_table_info('library');" }
];

const QUIZ = [
  { q:"A foreign key is used to…", o:["Uniquely identify a row","Link two tables and keep references valid","Speed up all queries","Store NULL values only"], a:1,
    why:"A foreign key refers to a primary/candidate key of another table, enforcing referential integrity." },
  { q:"In ACID, what does 'I' stand for?", o:["Integrity","Isolation","Indexing","Inheritance"], a:1,
    why:"Isolation: concurrent transactions do not interfere with each other." },
  { q:"A table is in 1NF when…", o:["It has no transitive dependency","It has no partial dependency","All attribute values are atomic","Every determinant is a superkey"], a:2,
    why:"1NF requires atomic values: no repeating groups or multi-valued cells." },
  { q:"2NF removes…", o:["Partial dependency","Transitive dependency","Multivalued dependency","Join dependency"], a:0,
    why:"2NF: no non-key attribute depends on only part of a composite key." },
  { q:"3NF removes…", o:["Partial dependency","Transitive dependency","Atomicity problems","Foreign keys"], a:1,
    why:"3NF: non-key attributes must not depend on other non-key attributes." },
  { q:"BCNF requires that for every functional dependency X → Y, X is a…", o:["Foreign key","Candidate attribute","Superkey","Prime attribute"], a:2,
    why:"Boyce-Codd Normal Form: every determinant must be a superkey." },
  { q:"A minimal superkey is called a…", o:["Candidate key","Foreign key","Composite key","Alternate index"], a:0,
    why:"Candidate keys are minimal superkeys. One of them is chosen as the primary key." },
  { q:"Which of these is a DDL command?", o:["SELECT","UPDATE","ALTER TABLE","COMMIT"], a:2,
    why:"DDL defines structure: CREATE, ALTER, DROP, TRUNCATE. SELECT is DQL, UPDATE is DML, COMMIT is TCL." },
  { q:"Which of these is NOT an aggregate function?", o:["SUM","AVG","COUNT","ROUND"], a:3,
    why:"ROUND works on one value at a time (scalar). Aggregates collapse many rows into one." },
  { q:"Which join returns all rows from the left table plus matching rows from the right?", o:["INNER JOIN","LEFT JOIN","CROSS JOIN","SELF JOIN"], a:1,
    why:"LEFT JOIN keeps unmatched left rows and fills right columns with NULL." },
  { q:"HAVING is used to filter…", o:["Rows before grouping","Columns","Groups after aggregation","Tables"], a:2,
    why:"WHERE filters rows first. HAVING filters groups produced by GROUP BY." },
  { q:"Which command undoes the changes of the current transaction?", o:["COMMIT","SAVEPOINT","ROLLBACK","GRANT"], a:2,
    why:"ROLLBACK reverts to the last commit (or savepoint). COMMIT makes changes permanent." }
];
