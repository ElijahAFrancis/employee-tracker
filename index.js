const inquirer = require('inquirer')
const fs = require('fs')
const db = require('./db/server');

db.connect(err => {
    if(err) {
        console.error(err);
    } else {
        console.log('connected!');
        start()
    }
})

function start() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'what would you like to do?',
            choices: ['View Departments', 'Add Department', 'View Roles', 'Add Role', 'View Employees', 'Add Employee', 'Update Employee Role', 'quit']
        }
     ]).then((selection) => {
        if(selection.action === 'View Departments') {
            db.query(`SELECT * FROM department`, function (err, results) {
                if(err) {
                    console.error(err)
                } else {
                    console.table(results);
                    start()
                }
            })
        } else if (selection.action === 'Add Department') {
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'department',
                    message: 'What is the new department',
                    validate: input => {
                        if(input) {
                            return true
                        } else {
                            console.log('New department must have a name')
                            return false
                        }
                    }
                }
            ]).then((response) => {
                db.query(`insert into department (department_name) values (?)`, [response.department], (err, result) => {
                    if(err) {
                            console.error(err)
                    } else {
                        console.log(`${response.department} added to employee database`)
                    }
                })
            })
        } else if (selection.action === 'View Roles') {
            db.query(`select * from role`, function (err, results) {
                console.table(results);
                start()
            })
        } else if (selection.action === 'Add Role') {
            db.query(`select * from department`, function (err, departments) {
            if(err) {
                console.error(err)
            } else {
                var arr = []
                for (var i=0; i<departments.length; i++) {
                    arr.push(results[i].department_name);
                }
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'department',
                        message: 'Which department will the new role be a part of?',
                        choices: arr
                    },
                    {
                        type: 'input',
                        name: 'title',
                        message: 'What is the new role?',
                        validate: input => {
                            if(input) {
                                return true
                            } else {
                                console.log('New role must have a name')
                                return false
                            }
                        }
                    },
                    {
                        type: 'input',
                        name: 'salary',
                        message: 'What will the salary be?',
                        validate: input => {
                            if(input) {
                                return true
                            } else {
                                console.log('New role must have a salary')
                                return false
                            }
                        }
                    }
                ]).then((responses => {
                    for(var i=0; i<departments.length; i++) {
                        if (departments[i].department_name === responses.department) {
                            var department = departments[i];
                        }
                    }

                    db.query(`insert into role (title, salary, department_id) values (?, ?, ?)`, [responses.title, responses.salary, department.id], (err, result) => {
                        if(err) {
                            console.error(err)
                        } else {
                            console.log(`${responses.role} added to employee database`)
                            start()
                        }
                    })
                }))
            }
            })
        } else if (selection.action === 'View Employees') {
            db.query(`select * from employee`, function (err, results) {
                console.table(results);
                start()
            })
        } else if (selection.action === 'Add Employee') {
            db.query(`select * from department`, function (err, results) {
            console.log(results)
            })
        } else if (selection.action === 'Update Employee Role') {
            db.query(`select * from department`, function (err, results) {
                console.log(results)
            })
        } else if (selection.action === 'quit') {
            db.end();
            console.log('Bye!')
        }
    })
}
