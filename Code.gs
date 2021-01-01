function isAdminUser() {
  return true;
}
//OAUTH

function getAuthType() {
  var response = {
    type: 'OAUTH2'
  };
  return response;
}
var getOAuthService = function () {
  var scriptProps = PropertiesService.getScriptProperties();
  return OAuth2.createService('YNAB')
    .setAuthorizationBaseUrl('https://app.youneedabudget.com/oauth/authorize')
    .setTokenUrl('https://app.youneedabudget.com/oauth/token')
    .setScope('read-only')
    .setClientId(scriptProps.getProperty('OAUTH_CLIENT_ID'))
    .setClientSecret(scriptProps.getProperty('OAUTH_CLIENT_SECRET'))
    .setPropertyStore(PropertiesService.getUserProperties())
    .setCallbackFunction('authCallback');
};
function authCallback(request) {
  var authorized = getOAuthService().handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
}
function isAuthValid() {
  var service = getOAuthService();
  if (service == null) {
    return false;
  }
  return service.hasAccess();
}
function get3PAuthorizationUrls() {
  var service = getOAuthService();
  if (service == null) {
    return '';
  }
  return service.getAuthorizationUrl();
}
function resetAuth() {
  var service = getOAuthService();
  service.reset();
}

//CONFIG

function getConfig(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();
  var options = {
    headers: {
      Authorization: 'Bearer ' + getOAuthService().getAccessToken()
    }
  };
  var budgets = UrlFetchApp.fetch('https://api.youneedabudget.com/v1/budgets', options);
  var parsedResponse = JSON.parse(budgets).data.budgets;

  var budgetSelector = config
    .newSelectSingle()
    .setId('budget')
    .setName('Budget')
    .setHelpText("Select the budget you'd like to access.")
    .setAllowOverride(true);

  for (i = 0; i < parsedResponse.length; i++) {
    var label = parsedResponse[i].name;
    var value = parsedResponse[i].id;
    budgetSelector.addOption(config.newOptionBuilder().setLabel(label).setValue(value));
  }

  config
    .newSelectSingle()
    .setId('dataScope')
    .setName('Data Type')
    .setHelpText("Select the type of data you'd like to use.")
    .setAllowOverride(false)
    .addOption(config.newOptionBuilder().setLabel('Accounts').setValue('accounts'))
    .addOption(config.newOptionBuilder().setLabel('Transactions').setValue('transactions'))
    .addOption(config.newOptionBuilder().setLabel('Category Groups').setValue('category_groups'))
    .addOption(config.newOptionBuilder().setLabel('Categories').setValue('categories'))
    .addOption(config.newOptionBuilder().setLabel('Payees').setValue('payees'))

  return config.build();

}

//SCHEMA

function getFields(dataScope) {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  if (dataScope == 'accounts') {

    fields.newDimension()
      .setId('id')
      .setName('Account ID')
      .setDescription('Account ID')
      .setType(types.TEXT)
      .setGroup('accounts');

    fields.newDimension()
      .setId('name')
      .setName('Account name')
      .setDescription('Account name')
      .setType(types.TEXT)
      .setGroup('accounts');

    fields.newDimension()
      .setId('type')
      .setName('Account type')
      .setDescription('Account type')
      .setType(types.TEXT)
      .setGroup('accounts');

    fields.newDimension()
      .setId('on_budget')
      .setName('Account On Budget')
      .setDescription('True if the account is on budget')
      .setType(types.BOOLEAN)
      .setGroup('accounts');

    fields.newDimension()
      .setId('closed')
      .setName('Account Closed')
      .setDescription('True if the account is closed')
      .setType(types.BOOLEAN)
      .setGroup('accounts');

    fields.newDimension()
      .setId('note')
      .setName('Account note')
      .setDescription('Account note')
      .setType(types.TEXT)
      .setGroup('accounts');

    fields.newMetric()
      .setId('balance')
      .setName('Account Balance')
      .setDescription('The account balance')
      .setType(types.CURRENCY_USD)
      .setGroup('accounts')

    fields.newMetric()
      .setId('cleared_balance')
      .setName('Cleared Account Balance')
      .setDescription('The account cleared balance')
      .setType(types.CURRENCY_USD)
      .setGroup('accounts')

    fields.newMetric()
      .setId('uncleared_balance')
      .setName('Uncleared Account Balance')
      .setDescription('The account uncleared balance')
      .setType(types.CURRENCY_USD)
      .setGroup('accounts')

    fields.newMetric()
      .setId('transfer_payee_id')
      .setName('Transfer Payee ID')
      .setDescription('Transfer Payee ID')
      .setType(types.TEXT)
      .setGroup('accounts')

    fields.newDimension()
      .setId('deleted')
      .setName('Account Deleted')
      .setDescription('True if the account is deleted')
      .setType(types.BOOLEAN)
      .setGroup('accounts');
  }

  else if (dataScope == 'transactions') {

    fields.newDimension()
      .setId('id')
      .setName('Transaction ID')
      .setDescription('The transaction ID')
      .setType(types.TEXT)
      .setGroup('transactions')

    fields.newDimension()
      .setId('date')
      .setName('Transaction Date')
      .setDescription('Transaction date')
      .setType(types.YEAR_MONTH_DAY)
      .setGroup('transactions')

    fields.newMetric()
      .setId('amount')
      .setName('Transaction Amount')
      .setDescription('Transaction amount')
      .setType(types.CURRENCY_USD)
      .setGroup('transactions')

    fields.newDimension()
      .setId('memo')
      .setName('Transaction Memo')
      .setDescription('Transaction memo')
      .setType(types.TEXT)
      .setGroup('transactions')

    fields.newDimension()
      .setId('cleared')
      .setName('Cleared Transaction')
      .setDescription('True if the transaction is cleared')
      .setType(types.BOOLEAN)
      .setGroup('transactions')

    fields.newDimension()
      .setId('approved')
      .setName('Approved Transaction')
      .setDescription('True if the transaction is approved')
      .setType(types.BOOLEAN)
      .setGroup('transactions')

    fields.newDimension()
      .setId('flag_color')
      .setName('Transaction Flag Color')
      .setDescription('Transaction flag color')
      .setType(types.TEXT)
      .setGroup('transactions')

    fields.newDimension()
      .setId('account_id')
      .setName('Transaction Account ID')
      .setDescription('Transaction account ID')
      .setType(types.TEXT)
      .setGroup('transactions')

    fields.newDimension()
      .setId('payee_id')
      .setName('Transaction Payee ID')
      .setDescription('Transaction payee ID')
      .setType(types.TEXT)
      .setGroup('transactions')

    fields.newDimension()
      .setId('category_id')
      .setName('Transaction Category ID')
      .setDescription('Transaction category ID')
      .setType(types.TEXT)
      .setGroup('transactions')

    fields.newDimension()
      .setId('transfer_account_id')
      .setName('Transfer Account ID')
      .setDescription('Transfer account ID')
      .setType(types.TEXT)
      .setGroup('transactions')

    fields.newDimension()
      .setId('transfer_transaction_id')
      .setName('Transfer Transaction ID')
      .setDescription('Transfer transaction ID')
      .setType(types.TEXT)
      .setGroup('transactions')

    fields.newDimension()
      .setId('matched_transaction_id')
      .setName('Matched Transaction ID')
      .setDescription('Matched transaction ID')
      .setType(types.TEXT)
      .setGroup('transactions')

    fields.newDimension()
      .setId('import_id')
      .setName('Transaction Import ID')
      .setDescription('Transaction import ID')
      .setType(types.TEXT)
      .setGroup('transactions')

    fields.newDimension()
      .setId('deleted')
      .setName('Transaction Deleted')
      .setDescription('True if transaction was deleted')
      .setType(types.BOOLEAN)
      .setGroup('transactions')

    fields.newDimension()
      .setId('account_name')
      .setName('Transaction Account Name')
      .setDescription('Account that transaction came from')
      .setType(types.TEXT)
      .setGroup('transactions')

    fields.newDimension()
      .setId('payee_name')
      .setName('Transaction Payee Name')
      .setDescription('Transaction payee name')
      .setType(types.TEXT)
      .setGroup('transactions')

    fields.newDimension()
      .setId('category_name')
      .setName('Transaction Category Name')
      .setDescription('Transaction category name')
      .setType(types.TEXT)
      .setGroup('transactions')

  }

  else if (dataScope == 'category_groups') {
    fields.newDimension()
      .setId('id')
      .setName('Category Group ID')
      .setDescription('Category group ID')
      .setType(types.TEXT)
      .setGroup('category_groups')

    fields.newDimension()
      .setId('name')
      .setName('Category Group Name')
      .setDescription('Category group name')
      .setType(types.TEXT)
      .setGroup('category_groups')

    fields.newDimension()
      .setId('hidden')
      .setName('Category Group Hidden')
      .setDescription('True if category group is hidden')
      .setType(types.BOOLEAN)
      .setGroup('category_groups')

    fields.newDimension()
      .setId('deleted')
      .setName('Category Group Deleted')
      .setDescription('True if category group is deleted')
      .setType(types.BOOLEAN)
      .setGroup('category_groups')
  }

  else if (dataScope == 'categories') {
    fields.newDimension()
      .setId('id')
      .setName('Category ID')
      .setDescription('Category ID')
      .setType(types.TEXT)
      .setGroup('categories')

    fields.newDimension()
      .setId('category_group_id')
      .setName('Category Group ID')
      .setDescription('Category group ID')
      .setType(types.TEXT)
      .setGroup('categories')

    fields.newDimension()
      .setId('name')
      .setName('Category Name')
      .setDescription('Category name')
      .setType(types.TEXT)
      .setGroup('categories')

    fields.newDimension()
      .setId('hidden')
      .setName('Category Hidden')
      .setDescription('True if category is hidden')
      .setType(types.BOOLEAN)
      .setGroup('categories')

    fields.newDimension()
      .setId('original_category_group_id')
      .setName('Original Category Group ID')
      .setDescription('Original category group ID')
      .setType(types.TEXT)
      .setGroup('categories')

    fields.newDimension()
      .setId('note')
      .setName('Category Note')
      .setDescription('Category note')
      .setType(types.TEXT)
      .setGroup('categories')

    fields.newMetric()
      .setId('budgeted')
      .setName('Category Budgeted Amount')
      .setDescription('Category budgeted amount')
      .setType(types.CURRENCY_USD)
      .setGroup('categories')

    fields.newMetric()
      .setId('activity')
      .setName('Category Activity Amount')
      .setDescription('Category activity amount')
      .setType(types.CURRENCY_USD)
      .setGroup('categories')

    fields.newMetric()
      .setId('balance')
      .setName('Category Balance')
      .setDescription('Category balance')
      .setType(types.CURRENCY_USD)
      .setGroup('categories')

    fields.newDimension()
      .setId('goal_type')
      .setName('Category Goal Type')
      .setDescription('Category goal type')
      .setType(types.TEXT)
      .setGroup('categories')

    fields.newDimension()
      .setId('goal_creation_month')
      .setName('Category Goal Creation Month')
      .setDescription('Category goal creation month')
      .setType(types.TEXT)
      .setGroup('categories')

    fields.newMetric()
      .setId('goal_target')
      .setName('Category Goal Target')
      .setDescription('Category goal target')
      .setType(types.CURRENCY_USD)
      .setGroup('categories')

    fields.newDimension()
      .setId('goal_target_month')
      .setName('Category Goal Target Month')
      .setDescription('Category goal target month')
      .setType(types.TEXT)
      .setGroup('categories')

    fields.newMetric()
      .setId('goal_percentage_complete')
      .setName('Category Goal Percentage Complete')
      .setDescription('Category goal percentage complete')
      .setType(types.PERCENT)
      .setGroup('categories')

    fields.newDimension()
      .setId('deleted')
      .setName('Category Deleted')
      .setDescription('True if category is deleted')
      .setType(types.BOOLEAN)
      .setGroup('categories')
  }

  else if (dataScope == 'payees') {
    fields.newDimension()
      .setId('id')
      .setName('Payee ID')
      .setDescription('Payee ID')
      .setType(types.TEXT)
      .setGroup('payees')

    fields.newDimension()
      .setId('name')
      .setName('Payee Name')
      .setDescription('Payee name')
      .setType(types.TEXT)
      .setGroup('payees')

    fields.newDimension()
      .setId('transfer_account_id')
      .setName('Payee Transfer Account ID')
      .setDescription('Payee transfer account id')
      .setType(types.TEXT)
      .setGroup('payees')

    fields.newDimension()
      .setId('deleted')
      .setName('Payee Deleted')
      .setDescription('True if payee has been deleted')
      .setType(types.BOOLEAN)
      .setGroup('payees')
  }
  return fields;
}

function getSchema(request) {
  var dataScope = request.configParams.dataScope;
  var fields = getFields(dataScope).build();
  return { 'schema': fields };
}

//DATA
function getData(request) {
  console.log(request)
  var cc = DataStudioApp.createCommunityConnector();
  var dataScope = request.configParams.dataScope;
  var requestedFieldIds = request.fields.map(function (field) {
    return field.name;
  });
  var requestedFields = getFields(dataScope).forIds(requestedFieldIds);

  if (dataScope == 'category_groups')
    var urlEndpoint = 'categories'
  else
    var urlEndpoint = dataScope;

  // Fetch and parse data from API  
  var url = [
    'https://api.youneedabudget.com/v1',
    '/budgets/', request.configParams.budget, '/',
    urlEndpoint
  ];

  var options = {
    muteHttpExceptions: true,
    headers: {
      Authorization: 'Bearer ' + getOAuthService().getAccessToken()
    }
  };

  var response = UrlFetchApp.fetch(url.join(''), options);

  if (dataScope == 'categories') {
    var parsedResponse = [];
    var groupParsedResponse = JSON.parse(response).data['category_groups'];
    for (var group of groupParsedResponse) {
      var categories = group.categories;
      for (var category of categories) {
        parsedResponse.push(category);
      }
    }
  }
  else {
    var parsedResponse = JSON.parse(response).data[dataScope];
  }

  var rows = responseToRows(requestedFields, parsedResponse, dataScope);
  return {
    schema: requestedFields.build(),
    rows: rows
  };
}

function responseToRows(requestedFields, response, dataScope) {
  // Transform parsed data and filter for requested fields
  var fields = requestedFields.asArray();
  return response.map(function (item) {
    var row = [];
    fields.forEach(function (field) {
      if (dataScope == 'accounts') {
        switch (field.getId()) {
          case 'id':
            return row.push(item.id);
          case 'name':
            return row.push(item.name);
          case 'type':
            return row.push(item.type);
          case 'on_budget':
            return row.push(item.on_budget);
          case 'closed':
            return row.push(item.closed);
          case 'note':
            return row.push(item.note);
          case 'balance':
            return row.push(item.balance / 1000);
          case 'cleared_balance':
            return row.push(item.cleared_balance / 1000);
          case 'uncleared_balance':
            return row.push(item.uncleared_balance / 1000);
          case 'transfer_payee_id':
            return row.push(item.transfer_payee_id);
          case 'deleted':
            return row.push(item.deleted);
        }
      }
      else if (dataScope == 'transactions') {
        switch (field.getId()) {
          case 'id':
            return row.push(item.id);
          case 'date':
            return row.push(item.date.replace(/-/g, ''));
          case 'amount':
            return row.push(item.amount / 1000);
          case 'memo':
            return row.push(item.memo);
          case 'cleared':
            return row.push(item.cleared);
          case 'approved':
            return row.push(item.approved);
          case 'flag_color':
            return row.push(item.flag_color);
          case 'account_id':
            return row.push(item.account_id);
          case 'payee_id':
            return row.push(item.payee_id);
          case 'category_id':
            return row.push(item.category_id);
          case 'transfer_account_id':
            return row.push(item.transfer_account_id);
          case 'transfer_transaction_id':
            return row.push(item.transfer_transaction_id);
          case 'matched_transaction_id':
            return row.push(item.matched_transaction_id);
          case 'import_id':
            return row.push(item.import_id);
          case 'deleted':
            return row.push(item.deleted);
          case 'account_name':
            return row.push(item.account_name);
          case 'payee_name':
            return row.push(item.payee_name);
          case 'category_name':
            return row.push(item.category_name);
        }
      }
      else if (dataScope == 'category_groups') {
        switch (field.getId()) {
          case 'id':
            return row.push(item.id);
          case 'name':
            return row.push(item.name);
          case 'hidden':
            return row.push(item.hidden);
          case 'deleted':
            return row.push(item.deleted);
        }
      }
      else if (dataScope == 'categories') {
        switch (field.getId()) {
          case 'id':
            return row.push(item.id);
          case 'category_group_id':
            return row.push(item.category_group_id);
          case 'name':
            return row.push(item.name);
          case 'hidden':
            return row.push(item.hidden);
          case 'original_category_group_id':
            return row.push(item.original_category_group_id);
          case 'note':
            return row.push(item.note);
          case 'budgeted':
            return row.push(item.budgeted / 1000);
          case 'activity':
            return row.push(item.activity / 1000);
          case 'balance':
            return row.push(item.balance / 1000);
          case 'goal_type':
            return row.push(item.goal_type);
          case 'goal_creation_month':
            return row.push(item.goal_creation_month);
          case 'goal_target':
            return row.push(item.goal_target / 1000);
          case 'goal_target_month':
            return row.push(item.goal_target_month);
          case 'goal_percentage_complete':
            return row.push(item.goal_percentage_complete / 100);
          case 'deleted':
            return row.push(item.deleted);
        }
      }
      else if (dataScope == 'payees') {
        switch (field.getId()) {
          case 'id':
            return row.push(item.id);
          case 'name':
            return row.push(item.name);
          case 'transfer_account_id':
            return row.push(item.transfer_account_id);
          case 'deleted':
            return row.push(item.deleted);
        }
      }
    });
    return { values: row };
  });
}