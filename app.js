const { assignTasksToDeveloper, fetchFilterData } = require('./toloka-apis')
const fs = require('fs');
const winston = require('winston');

const Project_name = 'Project P'

// Configure winston to log to a file
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.File({ filename: 'log/task_assign.log' })
    ]
});

// Function to read JSON file
function readJsonFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
}

const assignTasks = async () => {
    try {
        const payload = await readJsonFile('data/task_data.json');        
        
        // Calculate the sum of values in the payload
        const sum = Object.values(payload).reduce((total, value) => total + Number(value), 0);
        console.log(sum);
        logger.info(`Total Task assigning ${sum}:`);
        
        // Fetch the result of filter annotation
        const result = await fetchFilterData();
        console.log(result);
        
        if (!result || !result.tasks) {
            logger.error('Invalid result format from fetchFilterData.');
            throw new Error("Invalid result format from fetchFilterData.");
        }
        tasks = result.tasks;
        
        if (sum <= Number(result.total)) {
            const user_details = await readJsonFile('data/users_id.json');      // Ensure this function is awaited
            
            // Convert payload object to an array of [email, value] pairs
            const entries = Object.entries(payload);
        
            let taskIndex = 0;
            console.log("Beginning the task assignment process...");
            logger.info('Beginning the task assignment process...');
            // Iterate over the entries array
            for (let [email, value] of entries) {
                const user = user_details.find(user => user.email === email);
                if (user && Number(value) > 0) {
                    let data = [];
                    // Collect task IDs for the current user
                    for (let i = 0; i < Number(value); i++) {
                        if (tasks[taskIndex] && tasks[taskIndex].id) {
                            data.push(tasks[taskIndex].id);
                            taskIndex++;
                        } else {
                            console.warn("No more tasks available.");
                            logger.warn("No more tasks available.");
                            break; // Stop if no more tasks are available
                        }
                    }

                    // Convert data array to JSON string
                    const eachTasks = JSON.stringify(data);
                    // Perform the task assignment
                    let assignmentResult = await assignTasksToDeveloper(user.id, eachTasks);
                    // let assignmentResult = 200
                    if (assignmentResult === 200) {
                        console.log(`Successfully assigned ${value} tasks of ${Project_name} to ${user.email}: ${eachTasks}`)
                        // Log successful task assignment
                        logger.info(`Successfully assigned ${value} tasks of \`Project P\` to ${user.email}: ${eachTasks}`);
                    } else {
                        console.log(`Failed to assigned tasks to ${user.email}: ${eachTasks}`)
                        // Log failed task assignment
                        logger.error(`Failed to assigned tasks to ${user.email}: ${eachTasks}`)
                    }
                } else {
                    console.log(`Zero tasks assigned to ${user.email}: [null]`);
                    logger.info(`Zero tasks assigned to ${user.email}: [null]`);
                }
            }
            
            // Return a success message or result if needed
            console.log("All tasks have been successfully assigned.");
            logger.info('All tasks have been successfully assigned.');
        } else {
            console.log("Total Annotations Zero task is less than assigned tasks. Stopping the assignment.");
            logger.error('Total Annotations Zero task is less than assigned tasks. Stopping the assignment.');
        }
    } catch (error) {
        // Handle any errors that might occur
        console.error("An error occurred:", error);
        logger.error('Error occurs while assigning tasks. Stopping the assignment.');
    }
}

assignTasks()