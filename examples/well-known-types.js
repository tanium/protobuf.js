// this example demonstrates how to use well known types.

/*eslint-disable strict, no-console*/
var protobuf = require("..");

var root = protobuf.Root.fromJSON({
    nested: {
        google: {
            nested: {
                protobuf: {
                    nested: {
                        Timestamp: {
                            fields: {
                                seconds: {
                                    type: "int64",
                                    id: 1
                                },
                                nanos: {
                                    type: "int32",
                                    id: 2
                                }
                            }
                        },
                        Duration: {
                            fields: {
                                seconds: {
                                    type: "int64",
                                    id: 1
                                },
                                nanos: {
                                    type: "int32",
                                    id: 2
                                }
                            }
                        }
                    }
                }
            }
        },
        Message: {
            fields: {
                timestamp: {
                    type: "google.protobuf.Timestamp",
                    id: 1
                },
                duration: {
                    type: "google.protobuf.Duration",
                    id: 2
                }
            }
        }
    }
});

var Message = root.lookup("Message");

const msg = Message.fromObject({
    timestamp: new Date("2019-01-01"),
    duration: "5m",
});

console.log(msg);

console.log(msg.toJSON());
