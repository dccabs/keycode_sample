// app files
var shiftDown = false;

var windowapp  = angular.module('windowapp', ['ui.sortable','countryFilter'])
  .controller('windowCtrl', function windowCtrl($scope,$timeout,$sce,$http,$filter) {
//controller js

$scope.delay = 500;

$scope.autoActivate = true;

/* $scope.option1 = {value:'United States',init: false} */


$scope.topCountries = [
      {name: 'Belgium', code: 'BE'},
      {name: 'Canada', code: 'CA'}, 
      {name: 'France', code: 'FR'},
      {name: 'Germany', code: 'DE'},
      {name: 'Italy', code: 'IT'}, 
      {name: 'Japan', code: 'JP'},
      {name: 'Netherlands', code: 'NL'},
      {name: 'Sweden', code: 'SE'},
      {name: 'Switzerland', code: 'CH'},
      {name: 'United Kingdom', code: 'GB'},
      {name: 'United States', code: 'US'}
    ]
    
var storedRecentSelections = localStorage.getItem("recentSelections");


if (!storedRecentSelections) {
  storedRecentSelections = [];
} else {
  storedRecentSelections = JSON.parse(storedRecentSelections)
}

$scope.recentSelections = storedRecentSelections;

    
$scope.getInitialList = function() {
  var type = $scope.taskType;
  var list;
  if (type==1) {
    list = $scope.recentSelections;
  } else {
    list = $scope.topCountries;
  }
  
  return list;
}

$scope.restoreDefaults = function() {
  $scope.widgetOrder = 1;
  $scope.taskType = 1;
  $scope.taskName = "";
}

var storedWidget = localStorage.getItem("widgetOrder");

if (!storedWidget) {
  storedWidget = 1;
}


$scope.widgetOrder = storedWidget;

$scope.changeWidgetOrder = function() {
  localStorage.setItem("widgetOrder", this.widgetOrder);
}

var storedTaskType = localStorage.getItem("taskType");

if (!storedTaskType) {
  storedTaskType = 1;
}

$scope.taskType = storedTaskType;

$scope.changeTaskType = function() {
  localStorage.setItem("taskType", this.taskType);
  angular.forEach($scope.fields, function(i) {
    if (i.type=='autoComboBox') i.initialList = $scope.getInitialList();
  });
  
}

var storedTaskName = localStorage.getItem("taskName");

if (!storedTaskName) {
  storedTaskName = "";
}

$scope.taskName = storedTaskName;

$scope.changeTaskName = function() {
  localStorage.setItem("taskName", this.taskName);
}




$scope.dropTimeout;

$scope.predicate = 'sequence';

$scope.changeSelection = function() {
  
}

$scope.changeSequence = function() {
  var order = this.widgetOrder;
  if (order==2) {
    angular.forEach($scope.fields, function(item) {
      if (item.type == 'autocomplete') {
        item.sequence = 3;
      }
      if (item.type == 'comboBox') {
        item.sequence = 1;
      }
      if (item.type == 'autoComboBox') {
        item.sequence = 2;
      }
    });
  }
  if (order==1) {
    angular.forEach($scope.fields, function(item) {
      if (item.type == 'autocomplete') {
        item.sequence = 1;
      }
      if (item.type == 'comboBox') {
        item.sequence = 2;
      }
      if (item.type == 'autoComboBox') {
        item.sequence = 3;
      }
    });
  }
  if (order==3) {
    angular.forEach($scope.fields, function(item) {
      if (item.type == 'autocomplete') {
        item.sequence = 2;
      }
      if (item.type == 'comboBox') {
        item.sequence = 3;
      }
      if (item.type == 'autoComboBox') {
        item.sequence = 1;
      }
    });
  }
  
}


$scope.fields = [
  {
    id: 0001,
    sequence:1,
    name:'countries',
    type:'autocomplete',
    value:'',
    initialList:$scope.getInitialList(),
    expandedList:countries,
    focus:false,
    init:false,
    drop:false,
    filteredInitial:[],
    filteredAuto:[]
  },
  {
    id: 0002,
    sequence:2,
    name:'countries',
    type:'comboBox',
    value:'',
    initialList:$scope.topCountries,
    expandedList:countries,
    focus:false,
    init:false,
    drop:false,
    filteredInitial:[],
    filteredAuto:[]
  },
  {
    id:0003,
    sequence:3,
    name:'countries',
    type:'autoComboBox',
    value:'',
    initialList: $scope.getInitialList(),
    expandedList:countries,
    focus:false,
    init:false,
    drop:false,
    filteredInitial:[],
    filteredAuto:[]
  }
];


$scope.changeSequence();

$scope.option1 = {value:'',init: false}


$scope.openDrop = function(e) {
  this.item.drop = true;
}

$scope.blurField = function(e) {
  var item = this.item;
  $scope.closeDrop(item, e);
  item.focus = false;
  $timeout.cancel($scope.dropTimeout);
}

$scope.focusField = function(e) {
  var item = this.item;
  item.focus = true;
  this.item.inputDom = $(e.currentTarget)
  var el = $(e.currentTarget)
  
  if (!item.drop && $scope.autoActivate) {
    $scope.dropTimeout = $timeout(function() {
      item.drop = true;
    },$scope.delay)
  }
  
  $timeout(function() {
    el.select();
  },10);
}

$scope.changeField = function(item) {
  if (!item) {
    item = this.item;
  }
  
  item.selection ='';
  item.init = true;
  item.drop = true;
  item.value = item.value.charAt(0).toUpperCase() + item.value.slice(1);

  if (item.value.length==0) {
    item.countryMatch = false;
    angular.forEach(item.filteredInitial, function(subItem) {
      subItem.highlight = false;
    });
    return false;
  }
  
  if (item.value.length > 0) {
      item.countryMatch = false;
      angular.forEach($scope.countries, function(country) {
        if (country.name==item.value) {
          item.countryMatch = true;
        }
      });
  }
  
  $timeout(function() {
    if (item.filteredInitial.length > 0 && item.type=='autoComboBox') {
      item.filteredInitial[0].highlight = true;
      $scope.autoFill(item,item.filteredInitial[0]);
      
    } else if (item.filteredInitial.length > 0 && item.type=='comboBox') {
    
      //find a match in initial list
      var i = null;
      angular.forEach(item.filteredInitial, function(itm,x) {
        if (itm.name.substring(0,item.value.length).indexOf(item.value) != -1) {
          if (!i) i = x;
        }
      });
      
      item.filteredInitial[i].highlight = true;
      $scope.autoFill(item,item.filteredInitial[i]);
      
    } else if (item.filteredAuto.length > 0){
      item.filteredAuto[0].highlight = true;
      $scope.autoFill(item,item.filteredAuto[0]);
    }
    
    else if (item.filteredAutoComplete.length > 0){
      item.filteredAutoComplete[0].highlight = true;
      $scope.autoFill(item,item.filteredAutoComplete[0]);
    }
  }); 
  
  
}

$scope.autoFill = function(item,match) {
  if (item.type != 'comboBox') return;
  var el = item.inputDom;
  var l = item.value.length;
  //var subValue = item.value.substring(0,l);
  var subMatch = match.name;
  var subL = subMatch.length;
  
  item.inputDom.val(subMatch);
  
  item.inputDom.selectRange(l,subL);
  
  
}

$scope.isMouseClick = false;

$scope.selectOptionByMouse = function(item,e) { 
  var el = $(e.currentTarget)
  var parent = el.parents(".combo");
  
  var subItem = this.subItem.name;
  item.value = subItem;
  $scope.makeSelection(item);
  e.preventDefault();
  $scope.closeDrop(item, e);

/*
  $timeout(function() {
    parent.find("input").select();
  }, 10);
*/
  return;
}

$scope.makeSelection = function(item) {
  item.selection = item.value;
  
  var selectionArray = new Array;
  var dupe = false;
  angular.forEach($scope.recentSelections, function(sel) {
      if (item.selection == sel.name) dupe = true;
      selectionArray.push(sel.name);
  });
  
  if (dupe) return false;
  
  if (item.type=='autoComboBox') selectionArray.push(item.value);
  
  //selectionArray.sort();
  
  newSelections = []

  
  selectionArray.forEach(function(val) {
    var s = {
      name:val
    }
    newSelections.push(s);
    
  });
  
  console.log(item)

  $scope.recentSelections = newSelections;
    
  localStorage.setItem("recentSelections", JSON.stringify(newSelections));
  
  angular.forEach($scope.fields, function(i) {
    if (i.type=='autoComboBox') i.initialList = $scope.getInitialList();
  });
  
}

$scope.closeDrop = function(item,e) {
  var el = $(e.currentTarget)
  var parent = el.parents(".combo");
  
  item.drop = false;
  item.init = false;
  
  angular.forEach(item.initialList, function(subItem) {
      subItem.highlight = false;
  }); 
  
  angular.forEach(item.expandedList, function(subItem) {
      subItem.highlight = false;
  }); 
  
}


$scope.nextItem = function(item,list,skipList) {
  var noHighlight = true;
  angular.forEach(list, function(subItem,x) {
    var ll = list.length;
    if (ll > $scope.listSize) ll = $scope.listSize;
    if (subItem.highlight==true && noHighlight) {
      subItem.highlight = false
      noHighlight = false;
          
      if (x==ll-1) {
        if (skipList) {
          skipList[0].highlight = true;
        } else {
          list[ll-1].highlight = true;
        }
      } else {
        list[x+1].highlight = true;
      }
      return false;
    } 
  });
      
  if (noHighlight) {
    list[0].highlight = true;
  }
}

$scope.prevItem = function(item,list,skipList) {
  var noHighlight = true;
  
  angular.forEach(list, function(subItem,x) {
    var ll = list.length;
    if (subItem.highlight==true && noHighlight) {
      subItem.highlight = false
      noHighlight = false;
          
      if (x==0) {
        if (skipList) {
          var sl = skipList.length;
          skipList[sl-1].highlight = true;
        } else {
          list[0].highlight = true;
        }
      } else {
        list[x-1].highlight = true;
      }
      return false;
    } 
  });
      
  if (noHighlight) {
    list[ll].highlight = true;
  }
}



$scope.populateFieldByArrow = function(item,e) {
  
  var el = $(e.currentTarget)
  var parent = el.parents(".combo");
  var val;
  
  angular.forEach(item.initialList, function(subItem,x) {
        if (subItem.highlight) {
          val = subItem.name;
        }
  });
  
  angular.forEach(item.expandedList, function(subItem,x) {
        if (subItem.highlight) {
          val = subItem.name;
        }
  });
  
  $timeout(function() {
    parent.find("input").val(val).select();
  }, 10);
  return;
}




$scope.selectOptionByKey = function(item,e,closeDrop) { 
  var el = $(e.currentTarget)
  var parent = el.parents(".combo");
  
  if (item.noMatch) {
    item.selection = 'Invalid Entry';
  }
  
  var noHighlight = true;
  angular.forEach(item.initialList, function(subItem,x) {
        if (subItem.highlight) {
          item.value = subItem.name;
          $scope.makeSelection(item);
          noHighlight = false;
        }
  });
  
  angular.forEach(item.expandedList, function(subItem,x) {
        if (subItem.highlight) {
          item.value = subItem.name;
          $scope.makeSelection(item);
          noHighlight = false;
        }
  });
  
  if (item.type=='comboBox' && noHighlight && !item.noMatch) {
      $scope.makeSelection(item);
  }
  
  e.preventDefault();
  if (closeDrop) $scope.closeDrop(item, e);
/*
  item.drop = false;
  item.init = false;
*/
  
/*
  $timeout(function() {
    parent.find("input").select();
  }, 10);
*/
  return;
}

$scope.selectOptionByTab = function(item,e,closeDrop) {
  var el = $(e.currentTarget)
  var parent = el.parents(".combo");
  
  if (item.noMatch) {
    item.selection = 'Invalid Entry';
  }
  
  angular.forEach(item.initialList, function(subItem,x) {
        if (subItem.highlight) {
          item.value = subItem.name;
          $scope.makeSelection(item);
        }
  });
  
  angular.forEach(item.expandedList, function(subItem,x) {
        if (subItem.highlight) {
          item.value = subItem.name;
          $scope.makeSelection(item);
        }
  });
  
//  e.preventDefault();
  if (closeDrop) $scope.closeDrop(item, e);

}

$scope.listSize = 11;

$scope.fieldKeydown = function(e) {
  var item = this.item;
  var focused = $(".focused");
  var dropStatus = item.drop;
  var initStatus = item.init;
  var focusStatus = item.focus;
  
  
  //Backspace
  
  if (e.which==8) {
    var l = item.inputDom.val().length;
    var il = item.value.length;
    var caretStart = item.inputDom.caret().start;
    var caretEnd = item.inputDom.caret().end;
    var autoFill = false;
    if (l==caretEnd) {
      item.value=='';
      autoFill = false;
      return false;
      e.preventDefault();
    }
    
    if (caretEnd > caretStart) {
      autoFill = true;
    }

    if (autoFill) {
      item.value = item.value.substring(0,item.value.length-1)
      
      if (item.value.length==0 || item.value.length-1) {
        $scope.changeField(item);
      }
      e.preventDefault();
    }
  }
  
  
  //Tab
  if (e.which == 9) {
   $scope.selectOptionByTab(item,e,true)
  }
  
  //down arrow
  if (e.which == 40) {
    
    if (dropStatus) {
      var noHighlight = true;
      var initialL = item.initialList.length;
      var l = item.value.length;
      var filteredInitialL = item.filteredInitial.length
      var filteredAutoL = item.filteredAuto.length
      var initialActive = false;
      var autoActive = false;
      
      
      
      angular.forEach(item.filteredInitial, function(subItem) {
        if (subItem.highlight==true) {
          initialActive=true;
          return false;
        }
      });
      
      angular.forEach(item.filteredAuto, function(subItem) {
        if (subItem.highlight==true) {
          autoActive=true;
          return false;
        }
      });
      
      //only showing initial list unfiltered
      if (!item.init) {
        $scope.nextItem(item,item.initialList)
      }
      
      //showing filtered initial list
      if (item.init) {
        if (item.type=='comboBox') {
          $scope.nextItem(item,item.filteredInitial)
        }
      
        else if (initialActive || (!initialActive && !autoActive && item.filteredInitial.length > 0)) {
          $scope.nextItem(item,item.filteredInitial,item.filteredAuto)
        } else {
          $scope.nextItem(item,item.filteredAuto)
        }
      }
      
      $scope.populateFieldByArrow(item,e)
      
    }
  }
  
  //up arrow
  if (e.which == 38) {
    if (dropStatus) {
      var noHighlight = true;
      var initialL = item.initialList.length;
      var l = item.value.length;
      var filteredInitialL = item.filteredInitial.length
      var filteredAutoL = item.filteredAuto.length
      var initialActive = false;
      var autoActive = false;
      
      angular.forEach(item.filteredInitial, function(subItem) {
        if (subItem.highlight==true) {
          initialActive=true;
          return false;
        }
      });
      
      angular.forEach(item.filteredAuto, function(subItem) {
        if (subItem.highlight==true) {
          autoActive=true;
          return false;
        }
      });
      
      //only showing initial list unfiltered
      if (!item.init) {
        $scope.prevItem(item,item.initialList)
      }
      
      //showing filtered initial list
      if (item.init) {
        if (initialActive || (!initialActive && !autoActive && item.filteredInitial.length > 0)) {
          $scope.prevItem(item,item.filteredInitial)
        } else {
          $scope.prevItem(item,item.filteredAuto,item.filteredInitial)
        }
      }
      
      $scope.populateFieldByArrow(item,e)
      
    } 
  }
  
  //right arrow
  if (e.which == 39) {
    if (!dropStatus) {
      var next = focused.next(".combo");
      $timeout(function() {
        next.find("input").focus();
      });
    }
  }
  
  //left arrow
  if (e.which == 37) {
    if (!dropStatus) {
      var prev = focused.prev(".combo");
      $timeout(function() {
        prev.find("input").focus();
      });
    }
  }
  
  //ESCAPE
  if (e.which == 27) {
    $scope.closeDrop(item, e);
  }
  
  //Enter
  if (e.which == 13) {
    if (dropStatus) {
      $scope.selectOptionByKey(item,e,true)
      
    } else {
      $scope.closeDrop(item, e);
      item.focus = false;
      e.preventDefault();
      $timeout(function() {
        $(".command-line input").focus();
      });
      return;
    }
  }
  
  //SPACE
  if (e.which == 32) {
    if (!dropStatus) {
      item.drop = true;
      e.preventDefault();
    }
  }

}

$scope.clearLocal = function() {
  localStorage.clear();
  window.location.reload();
}



/* old functions */

$scope.commandKey = function(e) {
  //down arrow
  if (e.which == 40) {
    $timeout(function() {
      $(".combo:first input").focus();
    })
  }
}


$scope.initialList = true;

$scope.completeList = true;

$scope.countries = countries;


$scope.noDelay = false;

$scope.dropMenu;

$scope.filteredInitial = [];

$scope.filteredAuto = [];


$scope.filterLists = function() {
  var item = this.item;
  //return;
  item.filteredInitial = $filter('countryFilter')(item, item.type,item.initialList,$scope,item.value);
  item.filteredAuto = $filter('countryFilter')(item,item.type,item.expandedList,$scope,item.value,true,item.initialList);
  item.filteredAutoComplete = $filter('countryFilter')(item,item.type,item.expandedList,$scope,item.value,false,item.initialList);
  
}



}) // end controller


angular.module('countryFilter', []).filter('countryFilter', function() {
  return function(i,type,input,scope,o,removeDupes,initialList) {
    if (type == 'autocomplete') {
      initialList = false;
    }
    
    var l = o.length;
    o = o.toLowerCase();
    var matches = []
    if (l==0) {
      i.noMatch = false;
      i.noFullMatch = false;
      return input;
    } else {
      angular.forEach(input, function(item,x) {
        item.highlight = false;
        var sub = item.name.substring(0,l).toLowerCase();
        if (o==sub) {
          matches.push(item)
        }
      });
      
      if (removeDupes && scope.initialList) {
        //matches[0].highlight = true;
        iL = new Array
        mL = new Array
        
        angular.forEach(initialList, function(item,x) {
          iL.push(item.name)
          
        });
        
        angular.forEach(matches, function(item,x) {
          mL.push(item.name)
        });
        
        
        var counter = 0;
        
        angular.forEach(iL, function(itm,x) {
          var index = mL.indexOf(itm)

          if (index !=-1) {
            matches.splice(index-counter,1);
            counter = counter+1;
          }
        });
        

      } 
      //console.log(matches)
      
      if (matches.length > 0) {
        i.noMatch = false;
      } else {
        i.noMatch = true;
      }
      
      if (i.type=='comboBox') {
        if (!i.countryMatch && item.filteredInitial.length==0) {
          i.noMatch = true;
        }
      
      }
       
      return matches;
    }
    
  };
});
  
  
  
// JQUERY DOM stuff

$.fn.selectRange = function(start, end) {
    return this.each(function() {
        if(this.setSelectionRange) {
            this.focus();
            this.setSelectionRange(start, end);
        } else if(this.createTextRange) {
            var range = this.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    });
};

    $.fn.getCursorPosition = function() {
        var input = this.get(0);
        if (!input) return; // No (input) element found
        if ('selectionStart' in input) {
            // Standard-compliant browsers
            return input.selectionStart;
        } else if (document.selection) {
            // IE
            input.focus();
            var sel = document.selection.createRange();
            var selLen = document.selection.createRange().text.length;
            sel.moveStart('character', -input.value.length);
            return sel.text.length - selLen;
        }
    }

  
