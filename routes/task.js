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
    var newId = uuid();
    var params = {
        TableName: TASK_TABLE,
        Item: {
            "id": newId,
            "description": req.body.description,
            "completed": req.body.completed
        },
        ConditionExpression: "attribute_not_exists(id)"
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
    var completedBool = req.params.completed === 'true' ? true : false;
    var params = {
        TableName: TASK_TABLE,
        Key: {
            "id": req.params.id
        },
        UpdateExpression: "SET completed = :c",
        ExpressionAttributeValues: {
            ":c": completedBool
        },
        ReturnValues: "ALL_NEW"
    }
    docClient.update(params, function(err, data) {
        if (err) {
            console.error('Unable to update task\'s completed value. Error: ', JSON.stringify(err, null, 2));
            res.send('Unable to update task\'s completed value.');
        } else {
            console.log('Item\'s completed value updated.');
            res.send(data);
        }
    });
};

exports.setDescription = function(req,res) {
    var params = {
        TableName: TASK_TABLE,
        Key: {
            "id": req.params.id
        },
        UpdateExpression: "SET description = :d",
        ExpressionAttributeValues: {
            ":d": req.body.description
        },
        ReturnValues: "ALL_NEW"
    }
    docClient.update(params, function(err, data) {
        if (err) {
            console.error('Unable to update task\'s description. Error: ', JSON.stringify(err, null, 2));
            res.send('Unable to update task\'s description.');
        } else {
            console.log('Item\'s description updated.');
            res.send(data);
        }

    });
};
