var AWS = require("aws-sdk");
var fs = require('fs');
AWS.config.update({
    region: "us-east-2",
    endpoint: "http://localhost:8000"
});
var docClient = new AWS.DynamoDB.DocumentClient();
console.log("Importing tasks into DynamoDB. Please wait.");
var tasks = JSON.parse(fs.readFileSync('taskData.json', 'utf8'));
tasks.forEach(function(task) {
  console.log(task)
var params = {
        TableName: "Tasks",
        Item: {
            "id": task.id,
            "description": task.description,
            "completed": task.completed
        }
    };
docClient.put(params, function(err, data) {
       if (err) {
           console.error("Unable to add task", task.name, ". Error JSON:", JSON.stringify(err, null, 2));
       } else {
           console.log("PutItem succeeded:", task.name);
       }
    });
});
