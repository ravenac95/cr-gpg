var alerted = false;
function plugin0()
{
    return document.getElementById('plugin0');
}

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if (request.messageType == 'encrypt'){
            var mailList = request.encrypt.maillist;
            if( localStorage["useAutoInclude"] && localStorage["useAutoInclude"] != 'false'){
                mailList.push(localStorage["personaladdress"]);
            }
            var mailMessage = request.encrypt.message;
            var currentPubKeyList = [];
            for(var k in  plugin0().getPublicKeyList())
            {
                currentPubKeyList.push(plugin0().getPublicKeyList()[k].email);
            }
            for(var encRec in  mailList)
            {
                if(currentPubKeyList.indexOf(mailList[encRec]) == -1){
                    sendResponse({error:true,message: 'You do not have a public key stored for '+mailList[encRec] + ' please remove the user or import their public key',domid:request.encrypt.domel});        
                    return;
                }
                
            }
            
            var enc_result = plugin0().gpgEncrypt(mailMessage, mailList, '', '');
            if(!enc_result.error && enc_result.data){
                sendResponse({message: enc_result.data,domid:request.encrypt.domel});
            }else{
                sendResponse({error:true,message: enc_result.error_string,domid:request.encrypt.domel});
            };
        }else if(request.messageType == 'importkey'){
            var import_status = plugin0().gpgImportKey(request.import.message);
            sendResponse({message: import_status});
        }else if(request.messageType == 'sign'){
            var signing_key = '';
            //Note this assume we always want to use the first private key for signing.
            //It might be better to give the use a setting on the options page to choose what
            //they want
            for (var key in plugin0().getPrivateKeyList()){
                signing_key = key;
                break;
            }
            var sign_status = plugin0().gpgSignText([signing_key],request.sign.message, 2);
            sendResponse({message: sign_status,domid:request.sign.domel});
        }else if(request.messageType == 'verify'){    
            var verify_status = plugin0().gpgVerify(request.verify.message);
            sendResponse({message: verify_status ,domid:request.verify.domel})
        }else if(request.messageType == 'verifyDetached'){
            sendResponse({message:'Not Yet Support',domid:request.verify.domel});
            //sendResponse({message: plugin0().verifyMessageDetached(request.verify.message,request.verify.sig),domid:request.verify.domel});
        }else if(request.messageType == 'decrypt'){
            //TODO : Make sure you handle the multidec call which handles encryption within encryption
            var dec_result = plugin0().gpgDecrypt(request.decrypt.message);
            if(!dec_result.error){
                sendResponse({message: dec_result.data,domid:request.decrypt.domel});
            }else{
                sendResponse({message: 'An Error Occured',domid:request.decrypt.domel});
            };
        }else if(request.messageType == 'optionLoad'){
            chrome.tabs.create({'selected':true,'url': chrome.extension.getURL('options.html')});
            sendResponse('options opened');
        }else if(request.messageType == 'testSettings'){
            var returnMessage = plugin0().getPublicKeyList();
            sendResponse(returnMessage);   
        }
    }
);
