var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-east-2",
    endpoint: "http://localhost:8000"
});
var docClient = new AWS.DynamoDB.DocumentClient();
const TASK_TABLE = "Tasks";

exports.index = function(req, res) {
    var params = {
        TableName: TASK_TABLE,
        ProjectionExpression: "#id, #description, #completed",
        ExpressionAttributeNames: {
            "#id": "id",
            "#description": "description",
            "#completed": "completed"
        }
    };
    console.log("Scanning Tasks table.");
    docClient.scan(params, onScan);

    function onScan(err, data) {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            res.send(data)
            // print all the tasks
            console.log("Scan succeeded.");
            data.Items.forEach(function(task) {
                console.log(task.id, task.description, task.completed)
            });

            if (typeof data.LastEvaluatedKey != "undefined") {
                console.log("Scanning for more...");
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                docClient.scan(params, onScan);
            }
        }
    };
};

exports.getTask = function(req, res) {
    var taskId = parseInt(req.url.slice(7));
    console.log(req.url);
    console.log('taskId: ' + taskId);

    var params = {
        TableName: TASK_TABLE,
        KeyConditionExpression: "#id = :id",
        ExpressionAttributeNames: {
            "#id": "id"
        },
        ExpressionAttributeValues: {
            ":id": taskId
        }
    };

    docClient.query(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error: ", JSON.stringify(err, null, 2));
        } else {
            console.log("Query succeeded.");
            res.send(data.Items);
            data.Items.forEach(function(task) {
                console.log(task.id, task.description, task.completed);
            });
        }
    });
};

exports.addTask = function(req, res) {
    console.log(req.body);
    console.log('req.query.id: ' + req.body.id);
    console.log('req.query.description: ' + req.body.description);
    console.log('req.query.completed: ' + req.body.completed);
    var params = {
        TableName: TASK_TABLE,
        Item: {
            "id": parseInt(req.body.id),
            "description": req.body.description,
            "completed": req.body.completed
        }
    };
    docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON: ", JSON.stringify(err, null, 2));
            res.send('Unable to add item.');
        } else {
            // console.log("Added item: ", JSON.stringify(data, null, 2));
            res.send('Task added!');
        }
    });
};
