const TASK_TABLE = "Tasks";
const AWS = require("aws-sdk");
// must be configured before initializing doc client
AWS.config.update({
    region: "us-east-2",
    endpoint: "http://localhost:8000"
});

const docClient = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid/v4');

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
    var params = {
        TableName: TASK_TABLE,
        KeyConditionExpression: "#id = :id",
        ExpressionAttributeNames: {
            "#id": "id"
        },
        ExpressionAttributeValues: {
            ":id": req.params.id
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
    var params = {
        TableName: TASK_TABLE,
        Item: {
            "id": uuid(),
            "description": req.body.description,
            "completed": req.body.completed
        }
    };
    docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON: ", JSON.stringify(err, null, 2));
            res.send('Unable to add item.');
        } else {
            console.log("Added task!");
            res.send('Task added!');
        }
    });
};

exports.setCompleted = function(req, res) {
    console.log('setCompleted');
    console.log('req.params.id' + req.param.id);
    console.log('req.params.completedBool' + req.param.completedBool);
    res.send('setCompleted here');
};
