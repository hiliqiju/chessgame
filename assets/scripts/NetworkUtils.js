// 用法

// var network = require("NetworkUtils");

// network.send('URL',null,function(receiveData){

// console.log(receiveData);

// },null)



module.exports = {

  urlBase:'http://39.108.119.19:5000/',

  send:function (url,data,onRecive,onError) {

    var sendData='';

    if(data){

      for (var key in data) {

        if(sendData==='')

            sendData=key+'='+data[key];

        else

            sendData+='&'+key+'='+data[key];

      }

    }
	//console.log(sendData);
    var xhr = new XMLHttpRequest();

    

    xhr.onreadystatechange = function () {

      if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {

        onRecive&&onRecive(xhr.responseText);

      }

      else{

        onError&&onError(xhr.responseText);

      }

    };

    xhr.open("POST",this.urlBase+url,true);

    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;");

    xhr.send(sendData);

  }

};
