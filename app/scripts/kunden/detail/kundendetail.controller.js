'use strict';

/**
 */
angular.module('openolitor-admin')
  .controller('KundenDetailController', ['$scope', '$rootScope', '$filter',
    '$routeParams', 'KundenDetailService',
    '$location', '$uibModal', 'gettext', 'KundenDetailModel', 'ROLLE',
    'PendenzDetailModel', 'KundenOverviewModel',
    'KundentypenService', 'PersonCategoriesService' ,'alertService',
    'EnumUtil', 'DataUtil', 'PENDENZSTATUS', 'ANREDE', 'PAYMENT_TYPES', 'ABOTYPEN', 'appConfig',
    'msgBus', 'lodash', 'KundenRechnungenModel', 'ooAuthService', 'dialogService', 'gettextCatalog', 'EmailUtil',
    function($scope, $rootScope, $filter, $routeParams, KundenDetailService, $location,
      $uibModal, gettext, KundenDetailModel, ROLLE, PendenzDetailModel,
      KundenOverviewModel, KundentypenService, PersonCategoriesService, alertService, EnumUtil, DataUtil,
      PENDENZSTATUS, ANREDE, PAYMENT_TYPES, ABOTYPEN, appConfig,
      msgBus, lodash, KundenRechnungenModel, ooAuthService, dialogService, gettextCatalog, EmailUtil) {
      $rootScope.viewId = 'D-Kun';

      var defaults = {
        model: {
          id: undefined,
          typen: [],
          ansprechpersonen: [{
            id: undefined,
            anrede: undefined,
            categories: []
          }],
          pendenzen: [],
          abweichendeLieferadresse: false,
          paymentType: "Anderer"
        }
      };

      $scope.einladungSend = {};
      $scope.einladungSendFailed = {};

      $scope.resetOtpOk = {};
      $scope.resetOtpFailed = {};

      $scope.personCategories = [];

      $scope.abotypenArray = EnumUtil.asArray(ABOTYPEN).map(function(typ) {
        return typ.id;
      });

      $scope.pendenzstatus = EnumUtil.asArray(PENDENZSTATUS);
      $scope.rollen = EnumUtil.asArray(ROLLE);
      $scope.anreden = ANREDE;
      $scope.paymentTypes = PAYMENT_TYPES;
      $scope.updatingAbo = {};
      $scope.selectedAbo = undefined;

      $scope.$watch(PersonCategoriesService.getPersonCategories,
        function(list) {
          if (list) {
            angular.forEach(list, function(item) {
              //check if system or custom personentyp, use only id
              var personCategory = (item.personCategory) ? item.personCategory:
                item;

              $scope.personCategories.push({
                'id': personCategory.id,
                'name': personCategory.name
              });
            });
          }
      });

      $scope.actions = [{
        noEntityText: true,
        labelFunction: function() {
          if ($scope.isExisting()) {
            return $scope.kundeBezeichnung() + ' ' + gettextCatalog.getString('speichern');
          } else {
            return ($scope.kundeBezeichnung() || gettext('Kunde')) + ' ' + gettext('erstellen');
          }
        },
        onExecute: function() {
          return $scope.save();
        }
      }, {
        label: gettext('E-Mail an alle Ansprechpersonen'),
        noEntityText: true,
        iconClass: 'glyphicon glyphicon-envelope',
        onExecute: function() {
          var emailAddresses = lodash($scope.kunde.ansprechpersonen)
            .map('email')
            .value();

          EmailUtil.toMailToLink(emailAddresses);
          return true;
        },
        isDisabled: function() {
          return !$scope.isExisting();
        }
      }];

      $scope.loadKunde = function() {
        KundenDetailModel.get({
          id: $routeParams.id
        }, function(result) {
          $scope.kunde = result;
            if (!$scope.kunde.kontoDaten)
            $scope.kunde.kontoDaten = {
                nameAccountHolder : $scope.kunde.bezeichnung,
                addressAccountHolder : $scope.kunde.hausNummer + " " + $scope.kunde.strasse + ", " + $scope.kunde.plz + " " + $scope.kunde.ort,
                dateOfSignature:  moment().startOf('day').toDate()
            }
            else {
                if (!$scope.kunde.kontoDaten.nameAccountHolder){
                    $scope.kunde.kontoDaten.nameAccountHolder = $scope.kunde.bezeichnung;
                }
                if (!$scope.kunde.kontoDaten.addressAccountHolder){
                    $scope.kunde.kontoDaten.addressAccountHolder = $scope.kunde.hausNummer + " " + $scope.kunde.strasse + ", " + $scope.kunde.plz + " " + $scope.kunde.ort;
                }
                if (!$scope.kunde.kontoDaten.dateOfSignature){
                    $scope.kunde.kontoDaten.dateOfSignature =  moment().startOf('day').toDate();
                }
            }

          if ($routeParams.aboId) {
            var abo = lodash.filter($scope.kunde.abos,
              function(a) {
                return a.id === parseInt($routeParams.aboId);
              });
            if (abo && abo.length === 1) {
              $scope.selectAbo(abo[0]);
            }
          }

          angular.forEach($scope.kunde.ansprechpersonen, function(person) {
            person.initRolle = person.rolle;
          });

          $scope.rechnungen = KundenRechnungenModel.query({
            kundeId: $scope.kunde.id
          });
        });
      };

      if (!$routeParams.id) {
        $scope.kunde = new KundenDetailModel(defaults.model);
        $scope.pendenzen = [];
      } else {
        $scope.loadKunde();
      }

      $scope.navigateToKunde = function(item) {
        $location.path('/kunden/'+item.id);
      };

      $scope.getKunden = function(filter) {
        if ($scope.loading) {
          return;
        }

        $scope.loading = true;

        return KundenOverviewModel.query({
          q: filter
        }, function() {
          $scope.loading = false;
        }).$promise.then(function(kunden) {
          var filtered = $filter('filter')(kunden, filter);
          console.log('Filtered: ', filtered, ' with filter ', filter);
          return filtered;
        });
      };


      $scope.open = {
        pendenzdatum: false,
      };
      $scope.openCalendar = function(e, date) {
        e.preventDefault();
        e.stopPropagation();

        $scope.open[date] = true;
      };

      $scope.kundeBezeichnung = function() {
        if ($scope.kunde && $scope.kunde.ansprechpersonen) {
          if ($scope.kunde.ansprechpersonen.length > 1) {
            return $scope.kunde.bezeichnung;
          } else {
            return $scope.fullName(0);
          }
        }
        return undefined;
      };

      $scope.personEmail = function(index) {
        var ret = ' ';
        if ($scope.kunde.ansprechpersonen[index].email) {
          ret = $scope.kunde.ansprechpersonen[index].email;
        }
        return ret;
      };

      $scope.personPhone = function(index) {
        var ret = ' ';
        var foundPhone = false;
        if ($scope.kunde.ansprechpersonen[index].telefonMobil) {
          ret = $scope.kunde.ansprechpersonen[index].telefonMobil;
          foundPhone = true;
        }
        if (!foundPhone && $scope.kunde.ansprechpersonen[index].telefonFestnetz) {
          ret = $scope.kunde.ansprechpersonen[index].telefonFestnetz;
        }
        return ret;
      };

      $scope.personClass = function(index) {
        if (!angular.isUndefined($scope.kunde) && !angular.isUndefined($scope.kunde.ansprechpersonen) &&
          $scope.kunde.ansprechpersonen[index].id === undefined) {
          return 'in';
        }
      };

      $scope.fullName = function(index) {
        if ($scope.kunde && $scope.kunde.ansprechpersonen && $scope.kunde.ansprechpersonen[
            index] && $scope.kunde.ansprechpersonen[index].vorname &&
          $scope.kunde.ansprechpersonen[
            index].name) {
          var anrede = ($scope.kunde.ansprechpersonen[index].anrede) ?
            $scope.kunde.ansprechpersonen[index].anrede + ' ' : '';

          return anrede + $scope.kunde.ansprechpersonen[index].vorname +
            ' ' +
            $scope.kunde.ansprechpersonen[
              index].name;
        }
        return undefined;
      };

      $scope.addPerson = function() {
        $scope.kunde.ansprechpersonen.push({
          id: undefined,
          anrede: undefined,
          categories: []
        });
      };

      $scope.removePerson = function(index) {
        dialogService.displayDialogOkAbort(
          gettextCatalog.getString('Soll diese Person wirklich gelöscht werden?'),
          function() {
            var person = $scope.kunde.ansprechpersonen.splice(index, 1);
            //remove as well from remote side
            if ($routeParams.id && person[0].id) {
	            KundenDetailService.deletePerson($routeParams.id, person[0].id);
            }
          }
         );
      };

      $scope.switchLogin = function(person) {
        //this is already the new, requested value
        if(person.loginAktiv) {
          KundenDetailService.enableLogin($routeParams.id, person.id);
        } else {
          KundenDetailService.disableLogin($routeParams.id, person.id);
        }
      };

      $scope.sendEinladung = function(person) {
        if(angular.isUndefined(person.email) || person.email === '') {
          return;
        }
        $scope.einladungSend[person.email] = false;
        $scope.einladungSendFailed[person.email] = false;
        KundenDetailService.sendEinladung($routeParams.id, person.id)
          .then(function successCallback(response) {
            $scope.einladungSend[person.email] = true;
          }, function errorCallback(response) {
            $scope.einladungSendFailed[person.email] = true;
          });
      };

      $scope.resetOtp = function(person) {
        $scope.resetOtpOk[person.id] = false;
        $scope.resetOtpFailed[person.id] = false;
        KundenDetailService.resetOtp($routeParams.id, person.id)
        .then(function successCallback(response) {
          $scope.resetOtpOk[person.id] = true;
        }, function errorCallback(response) {
          $scope.resetOtpFailed[person.id] = true;
        });
      }

      $scope.changeRolle = function(person) {
        if(person.rolle === undefined || person.rolle === null) {
          //detault value
          person.rolle = ROLLE.KUNDE;
        }
        KundenDetailService.changeRolle($routeParams.id, person.id, person.rolle)
          .then(function successCallback(response) {
            person.initRolle = person.rolle;
          });
      };

      $scope.addPendenz = function() {
        $scope.kunde.pendenzen.push({
          id: undefined,
          datum: new Date(),
          status: PENDENZSTATUS.AUSSTEHEND,
          editable: true
        });
      };

      $scope.editPendenz = function(pendenz) {
        pendenz.editable = true;
      };

      $scope.deletePendenz = function(pendenz) {
        var index = $scope.kunde.pendenzen.indexOf(pendenz);
        if (index > -1) {
          $scope.kunde.pendenzen.splice(index, 1);
          //remove as well from remote side
          var p = lodash.extend({
            kundeId: $routeParams.id
          }, pendenz);
          new PendenzDetailModel(p).$delete();
        }
      };

      $scope.isKundeFormPristine = function () {
        var formPristine = true;
        angular.forEach($scope.kundeForm, function (element, name) {
            if (element && !(element.$pristine === undefined) && formPristine){
                formPristine = element.$pristine;
            }
        });
        return formPristine;
      }

      $scope.savePendenz = function(pendenz) {
        var p = lodash.extend({
          kundeId: $routeParams.id
        }, pendenz);
        new PendenzDetailModel(p).$save();
        $scope.kundeForm.$setPristine();
        if ($scope.isKundeFormPristine()) {
           $scope.kundeForm.$setPristine();
        }
      };

      $scope.isExisting = function() {
        return angular.isDefined($scope.kunde) &&
          angular.isDefined($scope.kunde.id);
      };

      $scope.hasLieferadresse = function() {
        return angular.isDefined($scope.kunde) && (
          (angular.isDefined($scope.kunde.strasseLieferung) && $scope.kunde
            .strasseLieferung !== '') ||
          (angular.isDefined($scope.kunde.plzLieferung) && $scope.kunde.plzLieferung !==
            '') ||
          (angular.isDefined($scope.kunde.ortLieferung) && $scope.kunde.ortLieferung !==
            '')
        );
      };

      $scope.save = function() {
        //force rewriting of ansprechperson
        if ($scope.kunde.ansprechpersonen.length === 1) {
          $scope.kunde.bezeichnung = undefined;
        }
        return $scope.kunde.$save(function(){
          $scope.kundeForm.$setPristine();
        });
      };

      $scope.created = function(id) {
        $location.path('/kunden/' + id);
      };

      $scope.backToList = function() {
        $location.path('/kunden');
      };

      $scope.canDelete = function() {
        return $scope.kunde && $scope.kunde.anzahlAbos === 0 && !lodash.find(
          $scope.kunde.ansprechpersonen,
          function(person) {
            return person.id === ooAuthService.getUser().personId;
          });
      };

      $scope.delete = function() {
        if (!$scope.canDelete()) {
          return;
        }
        return $scope.kunde.$delete();
      };
      $scope.isNewAbo = function() {
        return $scope.newAbo !== undefined;
      };

      $scope.showCreateAboDialog = function() {
        $scope.newAbo = {};
      };

      $scope.onAboCreated = function() {
        $scope.newAbo = undefined;
      };

      $scope.onAboCreateCanceled = function() {
        $scope.newAbo = undefined;
      };

      $scope.updatingAbo = function(abo) {
        return abo.id && $scope.updatingAbo[
          abo.id];
      };

      $scope.selectAbo = function(abo, itemId) {
        var allRows = angular.element('#abosTable table tbody tr');
        allRows.removeClass('row-selected');

        if ($scope.selectedAbo === abo) {
          $scope.selectedAbo = undefined;
        } else {
          $scope.selectedAbo = abo;
          var row = angular.element('#' + itemId);
          row.addClass('row-selected');
        }
      };

      $scope.unselectAbo = function() {
        $scope.selectedAbo = undefined;
        var allRows = angular.element('#abosTable table tbody tr');
        allRows.removeClass('row-selected');
      };

      $scope.unselectAboFunct = function() {
        return $scope.unselectAbo;
      };

      var isAboEntity = function(entity) {
        return $scope.abotypenArray.indexOf(entity) > -1;
      };

      msgBus.onMsg('EntityCreated', $rootScope, function(event, msg) {
        if (isAboEntity(msg.entity)) {
          if ($scope.kunde) {
            if (msg.data.kundeId === $scope.kunde.id) {
              if ($scope.kunde.abos) {
                $scope.kunde.abos.push(msg.data);
              } else {
                $scope.kunde.abos = [msg.data];
              }
              alertService.addAlert('info', gettext('Abo wurde erstellt'));
              $scope.$apply();
            }
          }
        } else if ($scope.kunde && msg.entity === 'Pendenz') {
          if ($scope.kunde) {
            if (msg.data.kundeId === $scope.kunde.id) {
              var pendenzen = lodash.filter($scope.kunde.pendenzen, function (
                p) {
                return p.id === undefined &&
                  moment(p.datum).startOf('day').isSame(moment(msg.data.datum)
                    .startOf('day')) &&
                  p.bemerkung === msg.data.bemerkung;
              });
              lodash.map(pendenzen, function (p) {
                p.editable = false;
                p.id = msg.data.id;
              });
              $scope.$apply();
            }
          }
        } else if (msg.entity === 'Person') {
          if ($scope.kunde && $scope.kunde.ansprechpersonen) {
            angular.forEach($scope.kunde.ansprechpersonen, function (
              person) {
              if (person.anrede === msg.data.anrede && person.vorname ===
                msg.data.vorname && person.name === msg.data.name) {
                //set id that entity won't get created twice
                person.id = msg.data.id;
                person.rolle = msg.data.rolle;
                $scope.$apply();
                return;
              }
            });
          }
        }
      });

      msgBus.onMsg('EntityModified', $rootScope, function (event, msg) {
        if (isAboEntity(msg.entity)) {
          if ($scope.kunde) {
            if (msg.data.kundeId === $scope.kunde.id) {
              angular.forEach($scope.kunde.abos, function (abo) {
                if (abo.id === msg.data.id) {
                  DataUtil.update(msg.data, abo);
                  $scope.$apply();
                  return;
                }
              });
            }
          }
        } else if ($scope.kunde && msg.entity === 'Pendenz') {
          if ($scope.kunde) {
            if (msg.data.kundeId === $scope.kunde.id) {
              lodash.map(lodash.filter($scope.kunde.pendenzen, function (p) {
                return p.id === msg.data.id;
              }), function (p) {
                p.editable = false;
              });
              $scope.$apply();
            }
          }
        } else if (msg.entity === 'Kunde') {
          $scope.$apply();
        } else if (msg.entity === 'PersonDetail') {
          if ($scope.kunde) {
            angular.forEach($scope.kunde.ansprechpersonen, function (person) {
              if (person.id === msg.data.id) {
                DataUtil.update(msg.data, person);
                $scope.$apply();
                return;
              }
            });
          }
        }
      });

      msgBus.onMsg('EntityDeleted', $rootScope, function(event, msg) {
        if (isAboEntity(msg.entity)) {
          if ($scope.kunde) {
            angular.forEach($scope.kunde.abos, function(abo) {
              if (abo.id === msg.data.id) {
                var index = $scope.kunde.abos.indexOf(abo);
                if (index > -1) {
                  $scope.kunde.abos.splice(index, 1);
                }
                $scope.selectedAbo = undefined;
                $scope.$apply();
                return;
              }
            });
          }
        }
      });
    }
  ]);
