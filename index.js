const inquirer = require('inquirer');
const db = require('./db/db');

//connecting to sql DB
db.connect(err => {
    if (err) {
        console.error(err)
    } else {
        console.log('Database connected.');
        start();
    }
});

//function for inquirer prompts
function start() {
    inquirer.prompt([{
        type: 'list',
        name: 'prompt',
        message: 'What would you like to do?',
        choices: ['View Departments', 'View Roles', 'View Employees', 'Add Department', 'Add Role', 'Add Employee', 'Update Employee Role', 'Quit']
    }]).then((selection) => {
        //each option has an if statement that performs the selected option
        if (selection.prompt === 'View Departments') {
            //gets all data from department table and logs the table in the console.
            //each "view" option does the same thing for each table
            db.query(`select * from department`, (err, result) => {
                if (err) {
                    console.error(err)
                } else {
                    console.table(result);
                    start();
                }
            });
        } else if (selection.prompt === 'View Roles') {
            db.query(`select * from role`, (err, result) => {
                if (err) {
                    console.error(err)
                } else {
                    console.table(result);
                    start();
                }
            });
        } else if (selection.prompt === 'View Employees') {
            db.query(`select * from employee`, (err, result) => {
                if (err) {
                    console.error(err)
                } else {
                    console.table(result);
                    start();
                }
            });
        } else if (selection.prompt === 'Add Department') {
            //gets the required information to create a new department
            inquirer.prompt([{
                type: 'input',
                name: 'department',
                message: 'What will the new department be?',
                validate: input => {
                    if (input) {
                        return true;
                    } else {
                        console.log('Department needs a name');
                        return false;
                    }
                }
            }]).then((responses) => {
                //inserts new department into the department table
                db.query(`insert into department (department_name) VALUES (?)`, [responses.department], (err, result) => {
                    if (err) {
                        console.error(err)
                    } else {
                        console.log(`${responses.department} added to employee database.`)
                        start();
                    }
                });
            })
        } else if (selection.prompt === 'Add Role') {
            //gets required information for new role
            var roleDepartment
            var departmentArr = []
            //pulls all data from department table for later question
            db.query(`select * from department`, (err, departments) => {
                    if (err) {
                        console.error(err)
                    } else {
                        for(i=0; i<departments.length; i++) {
                            departmentArr.push(departments[i].department_name);
                        }

                    inquirer.prompt([
                        {
                            type: 'input',
                            name: 'role',
                            message: 'What will the new role be?',
                            validate: input => {
                                if (input) {
                                    return true;
                                } else {
                                    console.log('New role needs a name');
                                    return false;
                                }
                            }
                        },
                        {
                            type: 'input',
                            name: 'salary',
                            message: 'What will the new roles salary be?',
                            validate: input => {
                                if (input) {
                                    return true;
                                } else {
                                    console.log('New role needs a salary');
                                    return false;
                                }
                            }
                        },
                        {
                            type: 'list',
                            name: 'department',
                            message: 'What department will the new role be a part of?',
                            choices: departmentArr
                        }
                    ]).then((responses) => {
                        //finds the selected department
                        for (var i = 0; i < departments.length; i++) {
                            if (departments[i].department_name === responses.department) {
                                roleDepartment = departments[i];
                            }
                        }
                        //inserts responses into role table
                        db.query(`insert into role (title, salary, department_id) values (?, ?, ?)`, [responses.role, responses.salary, roleDepartment.id], (err, result) => {
                            if (err) {
                                console.error(err)
                            } else {
                                console.log(`Added ${responses.role} to the database.`)
                                start();
                            }
                        });
                    })
                }
            });
        } else if (selection.prompt === 'Add Employee') {
            //asks for required information for new employee
            //gets all data from role table for later question
            db.query(`select * from role`, (err, roles) => {
                var roleArr = []
                if (err) {
                    console.error(err)
                } else {
                    for (var i = 0; i < roles.length; i++) {
                        roleArr.push(roles[i].title);
                    }
                    inquirer.prompt([
                        {
                            type: 'input',
                            name: 'firstName',
                            message: 'What is the new employees first name?',
                            validate: firstNameInput => {
                                if (firstNameInput) {
                                    return true;
                                } else {
                                    console.log('Employee needs a first name');
                                return false;
                                }
                            }
                        },
                        {
                            type: 'input',
                            name: 'lastName',
                            message: 'What is the employees last name?',
                            validate: lastNameInput => {
                                if (lastNameInput) {
                                    return true;
                                } else {
                                    console.log('Employee needs a last name');
                                    return false;
                                }
                            }
                        },
                        {
                            type: 'list',
                            name: 'role',
                            message: 'What is the employees role?',
                            choices: roleArr
                        },
                        {
                            type: 'input',
                            name: 'manager',
                            message: 'Who is the employees manager?'
                    }
                    ]).then((responses) => {
                        db.query(`select * from employee`, (err, employees) => {
                            for (var i = 0; i < roles.length; i++) {
                                if (roles[i].title === responses.role) {
                                var role = roles[i];
                                }
                            }
                            for (var i = 0; i < employees.length; i++) {
                                if(employees[i].first_name === responses.manager) {
                                    var managerId = employees[i].id
                                }
                            }
                            if (!managerId) {
                                console.log('New employee has no manager')
                            }
                            db.query(`insert into employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`, [responses.firstName, responses.lastName, role.id, managerId], (err, result) => {
                            if (err) {
                                console.error(err)
                            } else {
                                console.log(`${responses.firstName} ${responses.lastName} added to employee database`)
                                start();
                            }
                        })
                    });
                })
                }
            });
        } else if (selection.prompt === 'Update Employee Role') {
            var employeeArr = []
            var newEmployeeArray = []
            var roleArr = []
            var newRoleArray = []
            //gets data from employee and role databases and creates arrays for later questions
            db.query(`select * from employee, role`, (err, results) => {
                for (var i = 0; i < results.length; i++) {
                    employeeArr.push(results[i].last_name)
                }
                for (var i = 0; i < results.length; i++) {
                    roleArr.push(results[i].title)
                }
                newEmployeeArray = [...new Set(employeeArr)]
                newRoleArray = [...new Set(roleArr)]
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'employee',
                        message: 'Who do you want to update?',
                        choices: newEmployeeArray
                    },
                    {
                        type: 'list',
                        name: 'role',
                        message: 'What will their new role be?',
                        choices: newRoleArray
                    }
                ]).then((responses) => {
                    //finds role that matches selected role
                    db.query(`select * from role`, (err, roles) => {
                        var roleId
                        var employeeId
                        for (var i = 0; i < roles.length; i++) {
                            if (roles[i].title === responses.role) {
                            roleId = roles[i].id;
                            }
                        }
                        //finds employee that matches selected employee
                        db.query(`select * from employee`, (err, employees) => {

                            for (var i = 0; i < employees.length; i++) {
                                if (employees[i].last_name === responses.employee) {
                                    employeeId = employees[i].id;
                                }
                            }
                            //updates selected employee's role id in database
                            db.query(`update employee set role_id = ? where id = ?`, [roleId, employeeId], (err, result) => {
                                if (err) {
                                    console.error(err)
                                } else {
                                    console.log(`${responses.employee}'s role updated`)
                                    start();
                                }
                            });
                        })
                    })
                })
            });
        } else if (selection.prompt === 'Quit') {
            //ends inquirer and disconnects from db
            db.end();
            console.log("Thank you!");
        }
    })
};
//Became very tedious and difficult to follow using only arrow functions and then statements.
//In the future I'd separate each option into it's own function to make it easier to comprehend.