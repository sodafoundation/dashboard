const { exec } = require("child_process");

systemCheck  =  async (req, res, next) => {
    var reqParam = req.body;
    var responseBody = [];
    for(var i = 0; i < reqParam.length; i++){
        var check = reqParam[i];
        if(check.type == 'OS'){
            var result = await checkOS(check);
            responseBody.push(result);
        }
        if(check.type == 'software'){
            var result = await checkSoftware(check);
            responseBody.push(result);
        }
    }
    res.json(responseBody);
}

checkOS = async (check) => {
    return new Promise((resolve, reject) => {
        var requirement = check.requirement;
        exec("cat /etc/os-release", (error, stdout, stderr) => {
            var result = {
                type: check.type,
                status: {
                    name: false,
                    version: false
                },
                error: true,
                errorMessage: ''
            };
            if (error) {
                result.errorMessage = error.message;
                reject(result);
            }
            if (stderr) {
                result.errorMessage = stderr;
                reject(result);
            }
            var data = stdout.split('\n');
            result.error = false;
            for(var j = 0; j < data.length; j++){
                if(data[j].toLowerCase().indexOf('name') != -1 && data[j].toLowerCase().indexOf(requirement.name.toLowerCase()) != -1){
                    result.status.name = true;
                }
                if(data[j].toLowerCase().indexOf('version') != -1 && data[j].toLowerCase().indexOf(requirement.version) != -1){
                    result.status.version = true;
                }
            }
            resolve(result);
        });
    })
}

checkSoftware = async (check) => {
    return new Promise((resolve, reject) => {
        console.log(check);
        var requirement = check.requirement;
        var cmd = requirement.name.toLowerCase() + ' --version';
        exec(cmd, (error, stdout, stderr) => {
            var result = {
                type: check.type,
                software: requirement.name,
                status: {
                    name: false,
                    version: false
                },
                error: true,
                errorMessage: ''
            };
            if (error) {
                result.errorMessage = error.message;
                resolve(result);
            }
            if (stderr) {
                result.errorMessage = stderr;
                resolve(result);
            }
            
            var data = stdout.split('\n');
            console.log(data);
            result.error = false;
            if(data.length == 1){
                if(data[0].toLowerCase().indexOf(requirement.name.toLowerCase()) != -1){
                    result.status.name = true;
                }
                if(data[0].toLowerCase().indexOf(requirement.version) != -1){
                    result.status.version = true;
                }
            } else {
                for(var j = 0; j < data.length; j++){
                    if(data[j].toLowerCase().indexOf('name') != -1 && data[j].toLowerCase().indexOf(requirement.name.toLowerCase()) != -1){
                        result.status.name = true;
                    }
                    if(data[j].toLowerCase().indexOf('version') != -1 && data[j].toLowerCase().indexOf(requirement.version) != -1){
                        result.status.version = true;
                    }
                }
            }
            resolve(result);
        });
    })
}

const systemCheckCtrl = {
    systemCheck,
};

module.exports = systemCheckCtrl;