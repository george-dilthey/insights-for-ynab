  function myFunction() {
   var url = [
      'https://api.youneedabudget.com/v1',
      '/budgets/b6be349d-90a3-404d-b029-8b8bc12b4a0d/categories'
    ];
    var options = {muteHttpExceptions: true,
      headers: {
        Authorization: 'Bearer ' + '2b843210a5679662892a4f4e3c4abea722acab37048ac78b558dd59e8800cc65'  
      }
    };
    
    var response = UrlFetchApp.fetch(url.join(''), options);
    var parsedResponse = [];
  for(i=0; i<(JSON.parse(response).data.category_groups).length; i++){
   var parsedResponseGroups = (JSON.parse(response).data.category_groups[i].categories);
    for(j=0; j<parsedResponseGroups.length; j++){
      parsedResponse.push(parsedResponseGroups[j]);
   }
  }
 Logger.log(parsedResponse.length);
    console.log(response);
  
  }                
  
/*var url = [
      'https://api.youneedabudget.com/v1',
      '/budgets/b6be349d-90a3-404d-b029-8b8bc12b4a0d/accounts'
    ];
    var options = {muteHttpExceptions: true,
      headers: {
        Authorization: 'Bearer ' + '2b843210a5679662892a4f4e3c4abea722acab37048ac78b558dd59e8800cc65'  
      }
    };
    
    var response = UrlFetchApp.fetch(url.join(''), options);
    var parsedResponse2 = JSON.parse(response).data.accounts;
// Logger.log(parsedResponse2);
}

function arrayTest(){
  var array = [{1},{2},{3}]
*/