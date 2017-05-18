'use strict';

/**
 */
angular.module('openolitor-admin')
  .controller('AbosOverviewController', ['$scope', '$filter', '$location',
    'AbosOverviewModel', 'NgTableParams', 'AbotypenOverviewModel',
    'FilterQueryUtil', 'OverviewCheckboxUtil', 'localeSensitiveComparator', 'EmailUtil', 'lodash', 'PersonenOverviewModel',
    function($scope, $filter, $location, AbosOverviewModel, NgTableParams,
      AbotypenOverviewModel, FilterQueryUtil, OverviewCheckboxUtil, localeSensitiveComparator, EmailUtil, _, PersonenOverviewModel) {

      $scope.entries = [];
      $scope.filteredEntries = [];
      $scope.loading = false;
      $scope.selectedAbo = undefined;
      $scope.model = {};

      $scope.search = {
        query: '',
        queryQuery: '',
        filterQuery: ''
      };

      $scope.checkboxes = {
        checked: false,
        checkedAny: false,
        items: {},
        css: '',
        ids: []
      };

      $scope.hasData = function() {
        return $scope.entries !== undefined;
      };

      $scope.abotypL = [];
      AbotypenOverviewModel.query({
        q: ''
      }, function(list) {
        angular.forEach(list, function(abotyp) {
          $scope.abotypL.push({
            'id': abotyp.id,
            'title': abotyp.name
          });
        });
      });

      // watch for check all checkbox
      $scope.$watch(function() {
        return $scope.checkboxes.checked;
      }, function(value) {
        OverviewCheckboxUtil.checkboxWatchCallback($scope, value);
      });

      // watch for data checkboxes
      $scope.$watch(function() {
        return $scope.checkboxes.items;
      }, function() {
        OverviewCheckboxUtil.dataCheckboxWatchCallback($scope);
      }, true);

      $scope.toggleShowAll = function() {
        $scope.showAll = !$scope.showAll;
        $scope.tableParams.reload();
      };

      $scope.selectAbo = function(abo, itemId) {
        var firstRow = angular.element('#abosTable table tbody tr').first();
        var allButtons = angular.element('#abosTable table tbody button');
        allButtons.removeClass('btn-warning');
        var button = angular.element('#' + itemId);
        button.addClass('btn-warning');
        var offset = button.offset().top - firstRow.offset().top + 154;
        angular.element('#selectedAboDetail').css('margin-top', offset);
        if ($scope.selectedAbo === abo) {
          $scope.selectedAbo = undefined;
        } else {
          $scope.selectedAbo = abo;
        }

      };

      if (!$scope.tableParams) {
        //use default tableParams
        $scope.tableParams = new NgTableParams({ // jshint ignore:line
          page: 1,
          count: 10,
          sorting: {
            id: 'asc'
          },
          filter: {
            abotypId: ''
          }
        }, {
          filterDelay: 0,
          groupOptions: {
            isExpanded: true
          },
          exportODSModel: AbosOverviewModel,
          exportODSFilter: function() {
            return {
              f: $scope.search.filterQuery
            };
          },
          getData: function(params) {
            if (!$scope.entries) {
              return;
            }
            // use build-in angular filter
            var filteredData = $filter('filter')($scope.entries, $scope.search.queryQuery);
            // also filter by ngtable filters
            filteredData = $filter('filter')(filteredData, params.filter());
            var orderedData = $filter('filter')(filteredData, params.filter());
            orderedData = params.sorting ?
              $filter('orderBy')(orderedData, params.orderBy(), false, localeSensitiveComparator) :
              orderedData;

            $scope.filteredEntries = filteredData;

            params.total(orderedData.length);
            return orderedData.slice((params.page() - 1) * params.count(),
              params.page() * params.count());
          }

        });
      }

      $scope.actions = [{
        labelFunction: function() {
          return 'Rechnungen erstellen';
        },
        noEntityText: true,
        iconClass: 'glyphicon glyphicon-envelope',
        onExecute: function() {
          $scope.showCreateRechnungenDialog = true;
          return true;
        },
        isDisabled: function() {
          return !$scope.checkboxes.checkedAny;
        }
      }, {
        label: 'Email versenden',
        noEntityText: true,
        iconClass: 'glyphicon glyphicon-envelope',
        onExecute: function() {
          var kundeIds = _($scope.filteredEntries)
            .keyBy('id')
            .at($scope.checkboxes.ids)
            .map('kundeId')
            .value();

          PersonenOverviewModel.query({
            f: 'kundeId=' + kundeIds + ';'
          }, function(personen) {
            var emailAddresses = _(personen)
              .map('email')
              .value();

            EmailUtil.toMailToBccLink(emailAddresses);
            return true;
          });
        },
        isDisabled: function() {
          return !$scope.checkboxes.checkedAny;
        }
      }];

      function search() {
        if ($scope.loading) {
          return;
        }
        $scope.loading = true;
        AbosOverviewModel.query({
          f: $scope.search.filterQuery
        }, function(entries) {
          $scope.entries = entries;
          $scope.tableParams.reload();
          $scope.loading = false;
          $location.search('q', $scope.search.query);
        });
      }

      var existingQuery = $location.search().q;
      if (existingQuery) {
        $scope.search.query = existingQuery;
      }

      $scope.closeCreateRechnungenDialog = function() {
        $scope.showCreateRechnungenDialog = false;
      };

      $scope.$watch('search.query', function() {
        $scope.search.filterQuery = FilterQueryUtil.transform($scope.search
          .query);
        $scope.search.queryQuery = FilterQueryUtil.withoutFilters($scope.search
          .query);
        search();
      }, true);
    }
  ]);
