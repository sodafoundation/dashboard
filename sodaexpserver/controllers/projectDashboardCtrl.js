const axios = require('axios');



projectStatus =  async (req, res, next) => {
   try{
    console.log('EXECUTING THE TRY BLOCK ');
    const status = await checkProjectDashboard(req, res);
    res.status(200);
    res.json(status)
   } catch {
    console.log('EXECUTING THE CATCH BLOCK ');
    var errResp = {
        dashboard: 'notInstalled',
        status: 404,
        responseText: 'Bad Gatway'
    }
    res.status(404);
    res.json(errResp)
   }
}

function checkProjectDashboard(req, res, next){
    return new Promise((resolve, reject) => {
        reqParam = req.body; 
        console.log(reqParam);
        axios.get(reqParam.dashboardUrl).then(response => {
            var status = response.status;
            var responseText = response.statusText;
            if(status === 200){
                var resp = {
                    dashboard: 'installed',
                    status: status,
                    responseText
                }
                resolve(resp);
            }
        }).catch(error => {
            console.log('ERROR');
            console.log(error.message);
            reject(error.message);
        });
    });
}

const projectDashboardCtrl = {
    projectStatus,
};

module.exports = projectDashboardCtrl;
