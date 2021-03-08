'use strict';

/**
 */
angular.module('openolitor-admin')
  .controller('LieferplanungDetailController', ['$scope', '$rootScope',
    '$routeParams', 'NgTableParams', '$filter', 'LieferplanungModel',
    'ProduzentenService', 'AbotypenOverviewModel', 'ProdukteService',
    'alertService', 'dialogService', 'LIEFERSTATUS', 'LIEFEREINHEIT',
    'KORBSTATUS', 'msgBus', 'cloneObj', 'ReportvorlagenService',
    'gettext', '$location', 'lodash', '$uibModal', 'gettextCatalog', 'ProduktekategorienModel',
    function($scope, $rootScope, $routeParams, NgTableParams, $filter,
      LieferplanungModel, ProduzentenService, AbotypenOverviewModel,
      ProdukteService, alertService, dialogService, LIEFERSTATUS,
      LIEFEREINHEIT, KORBSTATUS, msgBus, cloneObj, ReportvorlagenService,
      gettext, $location, lodash, $uibModal, gettextCatalog, ProduktekategorienModel) {
      $rootScope.viewId = 'D-Pla';

      $scope.liefereinheiten = LIEFEREINHEIT;

      $scope.anzahlKoerbeZuLiefern = '...';
      $scope.anzahlAbwesenheiten = '...';
      $scope.anzahlSaldoZuTief = '...';
      $scope.produkteKategorie = gettextCatalog.getString('Keine');

      $scope.htmlView = false;

      $scope.search = {
        query: ''
      };

      var load = function() {
        LieferplanungModel.get({
          id: $routeParams.id
        }, function(result) {
          $scope.planung = result;
        });
      };

      $scope.kategorienL = [];
      ProduktekategorienModel.query({
        q: ''
       }, function(list) {
          $scope.kategorienL = lodash.map(lodash.sortBy(list, function(k) {
              return k.beschreibung.toLowerCase();
          }), function(a){
              return a.beschreibung;
          });
          $scope.kategorienL.unshift(gettextCatalog.getString('Keine'));
       });

      //watch for set of produkte
      $scope.$watch(ProdukteService.getProdukte,
        function(list) {
          if (list) {
            $scope.produkteEntries = [];
            $scope.allProdukteEntries = [];
            lodash.forEach(list, function(item) {
              if (item.id) {
                $scope.produkteEntries.push(item);
                $scope.allProdukteEntries.push(item);
              }
            });

            $scope.tableParams.reload();
            $scope.recalculateProduzentListen();
          }
        });

      $scope.getProduktById = function(id) {
        return lodash.find($scope.produkteEntries, function(produkt) {
          return produkt.id === id;
        });
      };

      $scope.getProduzentByKurzzeichen = function(kurzzeichen) {
        return lodash.find($scope.alleProduzentenL, function(produzent) {
          return (produzent.kurzzeichen === kurzzeichen);
        }) || {};
      };

      $scope.extractProduzentenFilter = function(extract, useKz) {
        var produzentenRawL = [];
        lodash.forEach($scope.alleProduzentenL, function(produzent) {
          if (angular.isUndefined(extract) || extract.indexOf(produzent
              .kurzzeichen) > -1) {
            produzentenRawL.push({
              'id': (useKz) ? produzent.kurzzeichen : produzent.id,
              'title': produzent.kurzzeichen
            });
          }
        });
        return $filter('orderBy')(produzentenRawL, 'id');
      };

      $scope.$watch(ProduzentenService.getProduzenten,
        function(list) {
          if (angular.isUndefined($scope.alleProduzentenL)) {
            $scope.alleProduzentenL = list;
          }
        }
      );

      LieferplanungModel.getLieferungen({
        id: $routeParams.id
      }, function(result) {
        $scope.abotypenLieferungen = result;
        $scope.recalculateProduzentListen(true);
        $scope.recalculateTotalAnzahl();
      });

      $scope.recalculateTotalAnzahl = function() {
        $scope.anzahlKoerbeZuLiefern = 0;
        $scope.anzahlAbwesenheiten = 0;
        $scope.anzahlSaldoZuTief = 0;
        lodash.forEach($scope.abotypenLieferungen,
          function(lieferung) {
            if(lieferung.abotyp.typ === 'Abotyp') {
              $scope.anzahlKoerbeZuLiefern += lieferung.anzahlKoerbeZuLiefern;
              $scope.anzahlAbwesenheiten += lieferung.anzahlAbwesenheiten;
              $scope.anzahlSaldoZuTief += lieferung.anzahlSaldoZuTief;
            }
          });
      };

      $scope.recalculateProduzentListen = function(addTableParams) {
        lodash.forEach($scope.abotypenLieferungen, function(
          abotypenLieferung) {

          lodash.forEach(abotypenLieferung.lieferpositionen,
            function(pos) {
              var prod = $scope.getProduktById(pos.produktId);
              var produzenten = angular.isUndefined(prod) ?
                undefined : prod.produzenten;
              pos.produzentenL = $scope.extractProduzentenFilter(
                produzenten);
            });
          if(!angular.isUndefined(addTableParams) && addTableParams) {
            $scope.addTableParams(abotypenLieferung);
          }
        });
      };

      var getProduzent = function(produzentId) {
        return lodash.find($scope.alleProduzentenL, function(produzent) {
          return produzent.id === produzentId;
        }) || {};
      };

      $scope.displayMode = 'korbinhalt';

      $scope.sammelbestellungen = {};

      if (!$scope.tableParams) {
        //use default tableParams
        $scope.tableParams = new NgTableParams({ // jshint ignore:line
          page: 1,
          count: 10000,
          sorting: {
            name: 'asc'
          },
        }, {
          filterDelay: 0,
          groupOptions: {
            isExpanded: true
          },
          getData: function(params) {
            if (!$scope.produkteEntries) {
              return;
            }
            // use build-in angular filter
            var filteredData = $filter('filter')($scope.produkteEntries,
              $scope.search.query);
            var orderedData = params.sorting ?
              $filter('orderBy')(filteredData, params.orderBy()) :
              filteredData;
            orderedData = $filter('filter')(orderedData, params.filter(),
              false);
            params.total(orderedData.length);
            return orderedData;
          }

        });
      }

      $scope.fetchVerfuegbareLieferungen = function() {
        LieferplanungModel.getVerfuegbareLieferungen({
          id: $routeParams.id
        }, function(result) {
          $scope.verfuegbareLieferungen = result;
        });
      };
      $scope.fetchVerfuegbareLieferungen();

      $scope.lieferung2add = function(addAbotyp) {
        var optionalBeschrieb = (addAbotyp.vertriebBeschrieb) ? '(' +
          addAbotyp.vertriebBeschrieb + ')' : '';
        return addAbotyp.abotypBeschrieb + ' ' + optionalBeschrieb +
          ' ' + $filter('date')(addAbotyp.datum);
      };

      $scope.addAbotypToPlanungFunc = function() {
        return $scope.addAbotypToPlanung;
      };

      $scope.filterDataForCategoriesFunc = function(){
        var filterDataForCategories = function(produkteKategorie){
          if ($scope.allProdukteEntries){
            if (produkteKategorie !== gettextCatalog.getString('Keine')){
              $scope.produkteKategorie = produkteKategorie;
              $scope.produkteEntries = lodash.filter($scope.allProdukteEntries, function(o){
                  return o.kategorien.includes(produkteKategorie);
              });
            } else {
              $scope.produkteKategorie = gettextCatalog.getString('Keine');
              $scope.produkteEntries = $scope.allProdukteEntries;
            }
            $scope.tableParams.reload();
          };
          return true;
        }
        return filterDataForCategories;
      };

      $scope.addAbotypToPlanung = function(abotypLieferung) {

        var index = $scope.verfuegbareLieferungen.indexOf(abotypLieferung);
        $scope.verfuegbareLieferungen.splice(index, 1);

        abotypLieferung.lieferpositionen = [];
        $scope.addTableParams(abotypLieferung);
        abotypLieferung.lieferplanungId = $scope.planung.id;
        $scope.abotypenLieferungen.push(abotypLieferung);
        LieferplanungModel.addLieferung({
          id: $routeParams.id,
          lieferungId: abotypLieferung.id
        }, abotypLieferung);
        return true;
      };

      $scope.removeAbotypFromPlanung = function(abotypLieferung) {
        var index = $scope.abotypenLieferungen.indexOf(abotypLieferung);
        if (index > -1) {
          $scope.abotypenLieferungen.splice(index, 1);
        }

        $scope.verfuegbareLieferungen.push(abotypLieferung);

        if (abotypLieferung.id) {
          return LieferplanungModel.removeLieferung({
            id: $routeParams.id,
            lieferungId: abotypLieferung.id
          }, []);
        }
      };

      $scope.removeProdukt = function(abotypLieferung, korbprodukt) {
        var index = abotypLieferung.lieferpositionen.indexOf(korbprodukt);
        if (index > -1) {
          abotypLieferung.lieferpositionen.splice(index, 1);
          abotypLieferung.tableParamsKorb.reload();
        }
      };

      $scope.getTotal = function(produkteEntries, abotypLieferung) {
        var total = 0;
        lodash.forEach(produkteEntries, function(korbprodukt) {
          if (angular.isDefined(korbprodukt.preisEinheit) && angular.isDefined(
              korbprodukt.menge)) {
            if (angular.isUndefined(korbprodukt.preis)) {
              $scope.calculatePreis(korbprodukt);
            }
            total += korbprodukt.preis;
          }
        });
        if(!angular.isUndefined(abotypLieferung)) {
          abotypLieferung.preisTotal = total;
        }
        return total;
      };

      $scope.getDiff = function(aboZielpreis, produkteEntries) {
        return aboZielpreis - $scope.getTotal(produkteEntries);
      };

      $scope.setMode = function(mode) {
        $scope.displayMode = mode;
      };

      $scope.getDurchschnittspreis = function(abotypLieferung) {
        if (angular.isUndefined(abotypLieferung.lieferpositionen) ||
          abotypLieferung.lieferpositionen.length === 0) {
          return abotypLieferung.durchschnittspreis;
        } else {
          return (((abotypLieferung.anzahlLieferungen - 1) * abotypLieferung.durchschnittspreis) +
            $scope.getTotal(abotypLieferung.lieferpositionen)) / (
            abotypLieferung.anzahlLieferungen);
        }
      };

      $scope.calculatePreis = function(korbprodukt) {
        korbprodukt.preis = (korbprodukt.preisEinheit * korbprodukt.menge);
        return korbprodukt.preis;
      };

      $scope.getDurchschnittspreisInfo = function(abotypLieferung) {
        return gettextCatalog.getString('# Lieferungen bisher: ') + (abotypLieferung.anzahlLieferungen - 1);
      };

      $scope.isInvalid = function(korbprodukt) {
        return !korbprodukt.produzentId || !korbprodukt.produktBeschrieb;
      };

      $scope.selectedProduzentFunc = function() {
        var selectedProduzent = function(produzent, korbprodukt) {
          korbprodukt.produzentId = produzent.id;
          korbprodukt.produzentKurzzeichen = produzent.title;
          return false; //not resetting dropdown
        };
        return selectedProduzent;
      };

      $scope.addTableParams = function(abotypLieferung) {
        if (!abotypLieferung.tableParamsKorb) {
          //use default tableParams
          abotypLieferung.tableParamsKorb = new NgTableParams({ // jshint ignore:line
            page: 1,
            count: 10000,
            sorting: {
              produktBeschrieb: 'asc'
            }
          }, {
            filterDelay: 0,
            groupOptions: {
              isExpanded: true
            },
            getData: function(params) {
              if (!abotypLieferung.lieferpositionen) {
                return;
              }
              // use build-in angular filter
              var filteredData = $filter('filter')(abotypLieferung.lieferpositionen,
                $scope.search.query);
              var orderedData = params.sorting ?
                $filter('orderBy')(filteredData, params.orderBy()) :
                filteredData;

              params.total(orderedData.length);
              return orderedData;
            }
          });
        }
      };

      $scope.dropProdukt = function(dragEl, dropEl, type) {
        $scope.korbForm.$setDirty();
        if (!$scope.valuesEditable()) {
          alertService.addAlert('lighterror', gettextCatalog.getString(
            'Die Lieferungen dürfen nicht mehr verändert werden.'));
          $scope.$apply();
          return;
        }

        var drop = angular.element('#' + dropEl);
        var drag = angular.element('#' + dragEl);

        if (dragEl === dropEl || drag.scope().abotypLieferung === drop.scope()
          .abotypLieferung) {
          return;
        }

        var checkOnDuplicateAndAskExec = function(newEntry) {
          drop.scope().abotypLieferung.lieferpositionen.push(newEntry);
          drop.scope().abotypLieferung.tableParamsKorb.reload();
        };

        var checkOnDuplicateAndAsk = function(lieferpositionen, newEntry) {
          var exists = lodash.find(lieferpositionen, function(entry) {
            return (newEntry.produktBeschrieb === entry.produktBeschrieb);
          });
          if (exists) {
            dialogService.displayDialogOkAbort(gettextCatalog.getString(
                'Ein solches Produkt befindet sich schon in diesem Korb. Soll es dennoch eingefügt werden?'
              ),
              function() {
                checkOnDuplicateAndAskExec(newEntry);
              });
          } else {
            checkOnDuplicateAndAskExec(newEntry);
          }
        };

        $scope.checkFreeProduct() ;
        switch (type) {
          case 'newProdukt':
            var prodUnlistet = {
              lieferungId: drop.scope().abotypLieferung.id,
              anzahl: drop.scope().abotypLieferung.anzahlKoerbeZuLiefern,
              produktId: null,
              produktBeschrieb: null,
              preisEinheit: 0.0,
              preis: 0.0,
              menge: 1,
              einheit: LIEFEREINHEIT.KILOGRAMM.id,
              produzentenL: $scope.extractProduzentenFilter(),
              produzentId: undefined,
              produzentKurzzeichen: undefined,
              unlisted: true
            };
            checkOnDuplicateAndAsk(drop.scope().abotypLieferung.lieferpositionen,
              prodUnlistet);

            break;
          case 'prod':
            var produkt = drag.scope().produkt;
            var produzent = (angular.isDefined(produkt.produzenten) &&
                produkt.produzenten.length === 1) ?
              $scope.getProduzentByKurzzeichen(produkt.produzenten[0]) : {
                id: undefined,
                label: undefined
              };
            var prodEntry = {
              lieferungId: drop.scope().abotypLieferung.id,
              anzahl: drop.scope().abotypLieferung.anzahlKoerbeZuLiefern,
              produktId: produkt.id,
              produktBeschrieb: produkt.name,
              preisEinheit: produkt.preis,
              menge: produkt.standardmenge,
              einheit: produkt.einheit,
              produzentenL: $scope.extractProduzentenFilter(produkt.produzenten),
              produzentId: produzent.id,
              produzentKurzzeichen: produzent.kurzzeichen
            };
            checkOnDuplicateAndAsk(drop.scope().abotypLieferung.lieferpositionen,
              prodEntry);
            break;
          case 'korbprod':
            var prodKorb = cloneObj(drag.scope().korbprodukt);
            checkOnDuplicateAndAsk(drop.scope().abotypLieferung.lieferpositionen,
              prodKorb);
            break;
          case 'korb':
            lodash.forEach(drag.scope().abotypLieferung.lieferpositionen,
              function(produkt2add) {
                var prodEntry = cloneObj(produkt2add);
                checkOnDuplicateAndAsk(drop.scope().abotypLieferung.lieferpositionen,
                  prodEntry);
              });
            break;
          default:
            //message?
        }
      };

      var addEntryToBestellungen = function(abotypLieferung, korbprodukt) {
        var produzent = korbprodukt.produzentKurzzeichen;
        if (angular.isUndefined(produzent)) {
          produzent = 'Noch nicht definierter Produzent';
        }

        var sammelbestellungByProduzent = $scope.sammelbestellungen[produzent];
        if (angular.isUndefined(sammelbestellungByProduzent)) {
          var produzentObj = $scope.getProduzentByKurzzeichen(produzent);
          sammelbestellungByProduzent = $scope.sammelbestellungen[produzent] = {
            produzentId: produzentObj.id || undefined,
            produzentKurzzeichen: produzent,
            total: 0,
            steuer: 0,
            totalSteuer: 0,
            bestellungen: {}
          };
        }

        var bestellungByAdminanteil = sammelbestellungByProduzent.bestellungen[abotypLieferung.abotyp.adminProzente];
        if (angular.isUndefined(bestellungByAdminanteil)) {
          bestellungByAdminanteil = $scope.sammelbestellungen[produzent].bestellungen[abotypLieferung.abotyp.adminProzente] = {
            produzentKurzzeichen: sammelbestellungByProduzent.produzentKurzzeichen,
            total: 0,
            steuer: 0,
            totalSteuer: 0,
            adminProzente: abotypLieferung.abotyp.adminProzente,
            adminProzenteAbzug: 0,
            totalNachAbzugAdminProzente: 0,
            lieferungen: {}
          };
        }
        var lieferungByProduzent = bestellungByAdminanteil.lieferungen[abotypLieferung.datum];
        if (angular.isUndefined(lieferungByProduzent)) {
          lieferungByProduzent = bestellungByAdminanteil.lieferungen[abotypLieferung.datum] = {
            datum: abotypLieferung.datum,
            positionen: {},
            total: 0,
            steuer: 0,
            totalSteuer: 0
          };
        }
        var anzahl = abotypLieferung.anzahlKoerbeZuLiefern;
        if (!angular.isUndefined(lieferungByProduzent.positionen[
            korbprodukt.produktBeschrieb +
            korbprodukt.menge])) {
          anzahl += lieferungByProduzent.positionen[korbprodukt.produktBeschrieb +
            korbprodukt.menge].anzahl;
        }
        lieferungByProduzent.positionen[
          korbprodukt.produktBeschrieb + korbprodukt.menge] = {
          anzahl: anzahl,
          produktBeschrieb: korbprodukt.produktBeschrieb,
          menge: korbprodukt.menge,
          einheit: korbprodukt.einheit,
          preisEinheit: korbprodukt.preisEinheit,
          preisPackung: (korbprodukt.preisEinheit * korbprodukt.menge),
          mengeTotal: (korbprodukt.menge * anzahl),
          preis: (korbprodukt.preisEinheit * korbprodukt.menge * anzahl)
        };
      };

      var calculateTotalsOfBestellungen = function(abotypLieferung, korbprodukt) {
        var produzent = korbprodukt.produzentKurzzeichen;
        var sammelbestellungByProduzent = $scope.sammelbestellungen[produzent];
        var bestellungByAdminanteil = sammelbestellungByProduzent.bestellungen[abotypLieferung.abotyp.adminProzente];
        var lieferungByProduzent = bestellungByAdminanteil.lieferungen[
          abotypLieferung.datum];
        var anzahl = abotypLieferung.anzahlKoerbeZuLiefern;

        lieferungByProduzent.total +=
          (korbprodukt.preisEinheit * korbprodukt.menge * anzahl);
        bestellungByAdminanteil.total += (korbprodukt.preisEinheit *
          korbprodukt.menge * anzahl);
        bestellungByAdminanteil.adminProzenteAbzug = ((bestellungByAdminanteil.adminProzente / 100) *
          bestellungByAdminanteil.total);
        bestellungByAdminanteil.totalNachAbzugAdminProzente = (bestellungByAdminanteil.total -
          bestellungByAdminanteil.adminProzenteAbzug);


        if ($scope.produzentIstBesteuert(korbprodukt.produzentId)) {
          bestellungByAdminanteil.steuerSatz = $scope.produzentSteuersatz(
            korbprodukt.produzentId);
          bestellungByAdminanteil.steuer = (bestellungByAdminanteil.totalNachAbzugAdminProzente / 100 *
            bestellungByAdminanteil.steuerSatz);
          bestellungByAdminanteil.totalSteuer = (bestellungByAdminanteil.totalNachAbzugAdminProzente +
            bestellungByAdminanteil.steuer);
        } else {
          bestellungByAdminanteil.steuer = 0;
          bestellungByAdminanteil.totalSteuer = bestellungByAdminanteil.totalNachAbzugAdminProzente;
        }
      };

      $scope.recalculateBestellungen = function(callbackFunc) {
        var recalculate = function(callbackFunc) {
          $scope.sammelbestellungen = {};
          if ($scope.planung.status === 'Offen') {
            lodash.forEach($scope.abotypenLieferungen, function(
              abotypLieferung) {
              lodash.forEach(abotypLieferung.lieferpositionen,
                function(korbprodukt) {
                  addEntryToBestellungen(abotypLieferung,
                    korbprodukt);
                });
            });
            lodash.forEach($scope.abotypenLieferungen, function(
              abotypLieferung) {
              lodash.forEach(abotypLieferung.lieferpositionen,
                function(korbprodukt) {
                  calculateTotalsOfBestellungen(abotypLieferung,
                    korbprodukt);
                });
            });
            if(!angular.isUndefined(callbackFunc)) {
              callbackFunc();
            }
          } else {
            LieferplanungModel.getSammelbestellungen({
              id: $routeParams.id
            }, function(sammelbestellungen) {
              lodash.forEach(sammelbestellungen, function(sammelbestellung) {
                $scope.sammelbestellungen[sammelbestellung.produzentKurzzeichen] = {
                  id: sammelbestellung.id,
                  produzentId: sammelbestellung.produzentId,
                  produzentKurzzeichen: sammelbestellung.produzentKurzzeichen,
                  total: (($scope.sammelbestellungen[sammelbestellung.produzentKurzzeichen]) ?
                    $scope.sammelbestellungen[sammelbestellung.produzentKurzzeichen].total : 0) + sammelbestellung.preisTotal,
                  steuer: sammelbestellung.steuer,
                  totalSteuer: (($scope.sammelbestellungen[sammelbestellung.produzentKurzzeichen]) ?
                    $scope.sammelbestellungen[sammelbestellung.produzentKurzzeichen].totalSteuer : 0) + sammelbestellung.totalSteuer,
                  bestellungen: {}
                };

                lodash.forEach(sammelbestellung.bestellungen, function(bestellung) {

                  $scope.sammelbestellungen[sammelbestellung.produzentKurzzeichen].bestellungen[bestellung.adminProzente] = {
                    id: bestellung.id,
                    produzentId: bestellung.produzentId,
                    produzentKurzzeichen: sammelbestellung.produzentKurzzeichen,
                    total: (($scope.sammelbestellungen[sammelbestellung.produzentKurzzeichen].bestellungen[bestellung.adminProzente]) ?
                      $scope.sammelbestellungen[sammelbestellung.produzentKurzzeichen].bestellungen[bestellung.adminProzente].total : 0) + bestellung.preisTotal,
                    steuer: bestellung.steuer,
                    totalSteuer: (($scope.sammelbestellungen[sammelbestellung.produzentKurzzeichen].bestellungen[bestellung.adminProzente]) ?
                      $scope.sammelbestellungen[sammelbestellung.produzentKurzzeichen].bestellungen[bestellung.adminProzente].totalSteuer :
                      0) + bestellung.totalSteuer,
                    adminProzente: bestellung.adminProzente,
                    adminProzenteAbzug: (($scope.sammelbestellungen[sammelbestellung.produzentKurzzeichen].bestellungen[bestellung.adminProzente]) ?
                      $scope.sammelbestellungen[sammelbestellung.produzentKurzzeichen].bestellungen[bestellung.adminProzente].adminProzenteAbzug :
                      0) + bestellung.adminProzenteAbzug,
                    totalNachAbzugAdminProzente: (($scope.sammelbestellungen[sammelbestellung.produzentKurzzeichen].bestellungen[bestellung.adminProzente]) ?
                      $scope.sammelbestellungen[sammelbestellung.produzentKurzzeichen].bestellungen[bestellung.adminProzente].totalNachAbzugAdminProzente :
                      0) + bestellung.totalNachAbzugAdminProzente,
                    lieferungen: {}
                  };
                  $scope.sammelbestellungen[sammelbestellung.produzentKurzzeichen].bestellungen[bestellung.adminProzente]
                    .lieferungen[sammelbestellung.datum] = {
                      id: bestellung.id,
                      datum: sammelbestellung.datum,
                      positionen: {},
                      total: bestellung.preisTotal,
                      steuer: bestellung.steuer,
                      steuerSatz: bestellung.steuerSatz,
                      totalSteuer: bestellung.totalSteuer,
                      adminProzente: bestellung.adminProzente,
                      adminProzenteAbzug: bestellung.adminProzenteAbzug,
                      totalNachAbzugAdminProzente: bestellung.totalNachAbzugAdminProzente
                    };
                    lodash.forEach(bestellung.positionen, function(bestellposition) {
                      if(angular.isDefined($scope.sammelbestellungen[sammelbestellung.produzentKurzzeichen]
                        .bestellungen[bestellung.adminProzente]
                        .lieferungen[sammelbestellung.datum])) {
                        $scope.sammelbestellungen[sammelbestellung.produzentKurzzeichen]
                          .bestellungen[bestellung.adminProzente]
                          .lieferungen[sammelbestellung.datum].positionen[
                            bestellposition.produktBeschrieb +
                            bestellposition.menge] = {
                            anzahl: bestellposition.anzahl,
                            produktBeschrieb: bestellposition
                              .produktBeschrieb,
                            menge: bestellposition.menge,
                            einheit: bestellposition.einheit,
                            preisEinheit: bestellposition.preisEinheit,
                            preisPackung: (bestellposition.preisEinheit *
                              bestellposition.menge),
                            mengeTotal: (bestellposition.menge *
                              bestellposition.anzahl),
                            preis: bestellposition.preis
                          };
                        }
                    });
                });
              });
              if(!angular.isUndefined(callbackFunc)) {
                callbackFunc();
              }
            });
          }
        };

        recalculate(callbackFunc);
      };

      $scope.hasMultipleLieferungen = function(bestellung) {
        return Object.keys(bestellung.lieferungen).length > 1;
      };

      $scope.produzentIstBesteuert = function(produzentId) {
        var prod = getProduzent(produzentId);
        return prod.mwst || false;
      };

      $scope.produzentSteuersatz = function(produzentId) {
        var prod = getProduzent(produzentId);
        return prod.mwstSatz || 0;
      };

      $scope.save = function() {
        $scope.korbForm.$setPristine();
        if ($scope.checkAllValues()) {
          $scope.editNachAbgeschlossen = false;
          var lieferungenModifyList = lodash.map($scope.abotypenLieferungen, function(abotypLieferung) {
            return {
                id: abotypLieferung.id,
                lieferpositionen: {
                  preisTotal: abotypLieferung.preisTotal,
                  lieferpositionen: abotypLieferung.lieferpositionen
                }
              };
          });

          LieferplanungModel.modifyLieferplanungData({
            id: $routeParams.id
          }, {
            id: parseInt($routeParams.id),
            lieferungen: lieferungenModifyList
          });

          return $scope.planung.$save();
        } else {
          return 'Noop';
        }
      };

      $scope.checkFreeProduct = function() {
        var ret = true;
        //check on Produzent on all Produkte
        lodash.forEach($scope.abotypenLieferungen, function(abotypLieferung) {
          lodash.forEach(abotypLieferung.lieferpositionen, function(
            korbEntry) {
            if (ret && angular.isUndefined(korbEntry.produzentId)) {
              ret = false;
            }
          });
        });
        return ret;
      };

      $scope.checkAllValues = function() {
        var ret = true;
        //check on Produzent on all Produkte
        lodash.forEach($scope.abotypenLieferungen, function(abotypLieferung) {
          lodash.forEach(abotypLieferung.lieferpositionen, function(
            korbEntry) {
            if (ret && angular.isUndefined(korbEntry.produzentId)) {
              ret = false;
              alertService.addAlert('lighterror', gettextCatalog.getString(
                'Für jedes Produkt muss ein Produzent ausgewählt sein.'
              ));
            }
            if (ret && angular.isUndefined(korbEntry.produktBeschrieb)) {
              ret = false;
              alertService.addAlert('lighterror', gettextCatalog.getString(
                'Jedes Produkt muss über eine Beschreibung verfügen.'
              ));
            }
          });
        });
        return ret;
      };

      $scope.backToList = function() {
        $location.path('/lieferplanung');
      };

      $scope.delete = function() {
        return $scope.planung.$delete();
      };

      $scope.editNachAbgeschlossen = false;

      $scope.setEditableNachAbgeschlossen = function() {
        $scope.korbForm.$setPristine();
        $scope.editNachAbgeschlossen = true;
      };

      $scope.valuesEditable = function(onlyOnOffen) {
        if (angular.isUndefined($scope.planung)) {
          return false;
        } else {
          if(onlyOnOffen || onlyOnOffen === true) {
            return $scope.planung.status === LIEFERSTATUS.OFFEN;
          } else {
            return $scope.planung.status === LIEFERSTATUS.OFFEN || $scope.editNachAbgeschlossen;
          }
        }
      };

      $scope.planungAbschliessen = function() {
        if ($scope.checkAllValues()) {
            LieferplanungModel.abschliessen({
              id: $routeParams.id
            }, function() {
              $scope.planung.status = LIEFERSTATUS.ABGESCHLOSSEN;
            });
        }
      };

      $scope.planungVerrechnen = function() {
        LieferplanungModel.verrechnen({
          id: $routeParams.id
        }, function() {
          $scope.planung.status = LIEFERSTATUS.VERRECHNET;
        });
      };

      $scope.sammelbestellungVersenden = function(bestellung) {
        LieferplanungModel.sammelbestellungVersenden({
          id: $routeParams.id,
          bestellungId: bestellung.id
        }, bestellung);
      };

      $scope.sammelbestellungenErstellen = function() {
        LieferplanungModel.sammelbestellungenErstellen({
          id: $routeParams.id
        }, function() {

        });
      };

      $scope.toggleHTML = function() {
        $scope.htmlView = !$scope.htmlView;
      };

      $scope.editBemerkungen = function() {
        $scope.modalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'scripts/lieferplanungen/detail/edit-bemerkungen.html',
          scope: $scope,
          size: 'lg'
        });

        $scope.modalInstance.result.then(function() {
          $scope.modalInstance = undefined;
        }, function() {

        });
      };

      $scope.closeEditBemerkungen = function() {
        $scope.modalInstance.close();
      };

      $scope.KORBSTATUS = KORBSTATUS;

      $scope.isUnlisted = function(korbprodukt) {
        if(!angular.isUndefined(korbprodukt.unlisted)) {
          return korbprodukt.unlisted;
        } else {
          return angular.isUndefined(korbprodukt.produktId) || korbprodukt.produktId === null;
        }
      };

      $scope.displayAbosTotal = function(korbStatus) {
        LieferplanungModel.getAllAboIdsByKorbStatus({
          id: $routeParams.id,
          korbStatus: korbStatus
        }, function(result) {
          $location.path('/abos').search({'q': 'id=' + result.join()});
        });
      };

      $scope.displayAbos = function(lieferungId, korbStatus) {
        LieferplanungModel.getAboIdsByKorbStatus({
          id: $routeParams.id,
          lieferungId: lieferungId,
          korbStatus: korbStatus
        }, function(result) {
          $location.path('/abos').search({'q': 'id=' + result.join()});
        });
      };

      $scope.displayZusatzabos = function(lieferungId, korbStatus) {
        LieferplanungModel.getZusatzaboIdsByKorbStatus({
          id: $routeParams.id,
          lieferungId: lieferungId,
          korbStatus: korbStatus
        }, function(result) {
          $location.path('/abos').search({'q': 'id=' + result.join()});
        });
      };

      $scope.abschliessenActionDisabled= [{
        label: gettextCatalog.getString('Lieferplanung abschliessen'),
        noEntityText: true,
        iconClass: 'glyphicon glyphicon-chevron-right',
        isDisabled: function() { return true; },
        onExecute: function() { }
      }];

      $scope.abschliessenAction = [{
        label: gettextCatalog.getString('Lieferplanung abschliessen'),
        confirmMessage: gettextCatalog.getString('Soll die Lieferplanung abgeschlossen werden?'),
        noEntityText: true,
        iconClass: 'glyphicon glyphicon-chevron-right',
        onExecute: function() {
          var hasEmpty = false;
          lodash.forEach($scope.abotypenLieferungen, function(abotypLieferung) {
            if((abotypLieferung.abotyp !== undefined && abotypLieferung.abotyp.typ !== 'ZusatzAbotyp') && (abotypLieferung.lieferpositionen === undefined || abotypLieferung.lieferpositionen.length === 0)) {
              hasEmpty = true;
            }
          });
          if(!hasEmpty) {
            return $scope.planungAbschliessen();
          } else {
            //ask if it's ok to have empty Lieferungen (no product)
            dialogService.displayDialogOkAbort(gettextCatalog.getString(
                'Eine oder mehrere Lieferungen aus Hauptabos haben keine Produkte eingetragen. \nTrotzdem fortfahren?'
              ),
              function() {
                return $scope.planungAbschliessen();
              });
          }

        }
      },{
        label: gettextCatalog.getString('Lieferplanung löschen'),
        iconClass: 'fa fa-times',
        confirmMessage: gettextCatalog.getString('Soll die Lieferplanung gelöscht werden?'),
        noEntityText: true,
        onExecute: function() {
          return $scope.delete();
        }
      }
      ];

      $scope.getPostAbschliessenAktionen = function() {
        return [{
          label: gettextCatalog.getString('Bestellung an alle Lieferanten versenden'),
          confirmMessage: gettextCatalog.getString('Sollen wirklich Mail an alle Lieferanten verschickt werden?'),
          iconClass: 'fa fa-check',
          noEntityText: true,
          isDisabled: function() { return angular.isUndefined($scope.planung) || $scope.planung.status !== 'Abgeschlossen'; },
          onExecute: function() {
            $scope.recalculateBestellungen(function() {
              lodash.forEach($scope.sammelbestellungen, function(sammelbestellung) {
                $scope.sammelbestellungVersenden(sammelbestellung);
              });
            });
          }
        },{
          label: gettextCatalog.getString('Abrechnungen anzeigen'),
          iconClass: 'fa fa-calculator',
          confirm: false,
          noEntityText: true,
          onExecute: function() {
            $scope.recalculateBestellungen(function() {
              var result = lodash.map($scope.sammelbestellungen, 'id');
              $location.path('/einkaufsrechnungen').search({'q': 'id=' + result.join()});
            });
          }
        },{
          label: gettextCatalog.getString('Depotauslieferungen anzeigen'),
          iconClass: 'fa fa-building-o',
          confirm: false,
          noEntityText: true,
          onExecute: function() {
            LieferplanungModel.getAllAuslieferungenByLieferplanungId({
              id: $routeParams.id
            }, function(result) {
              var res = lodash.map(result, 'id');
              $location.path('/depotauslieferungen').search({'q': 'id=' + res.join()});
            });
          }
        },{
          label: gettextCatalog.getString('Tourauslieferungen anzeigen'),
          iconClass: 'fa fa-truck',
          noEntityText: true,
          confirm: false,
          onExecute: function() {
            LieferplanungModel.getAllAuslieferungenByLieferplanungId({
              id: $routeParams.id
            }, function(result) {
              var res = lodash.map(result, 'id');
              $location.path('/tourauslieferungen').search({'q': 'id=' + res.join()});
            });
          }
        },{
          label: gettextCatalog.getString('Postauslieferungen anzeigen'),
          iconClass: 'fa fa-envelope',
          noEntityText: true,
          confirm: false,
          onExecute: function() {
            LieferplanungModel.getAllAuslieferungenByLieferplanungId({
              id: $routeParams.id
            }, function(result) {
              var res = lodash.map(result, 'id');
              $location.path('/postauslieferungen').search({'q': 'id=' + res.join()});
            });
          }
        }, {
          label: gettext('Lieferreport drucken'),
          iconClass: 'fa fa-print',
          confirm: false,
          onExecute: function() {
            $scope.reportType = 'lieferreport';
            $scope.vorlageTyp = 'Lieferreport';
            $scope.showGenerateReport = true;
            return true;
          }
        }];
      }

      $scope.closeBericht = function() {
        $scope.showGenerateReport = false;
      };

      $scope.closeBerichtFunct = function() {
        return $scope.closeBericht;
      };

      $scope.projektVorlagen = function() {
        return ReportvorlagenService.getVorlagen('VorlageLieferreport');
      };

      $scope.verrechnenActionDisabled= [{
        label: gettextCatalog.getString('Lieferplanung verrechnen'),
        noEntityText: true,
        iconClass: 'glyphicon glyphicon-chevron-right',
        isDisabled: function() { return true; },
        onExecute: function() { }
      }];

      $scope.verrechnenAction = [{
        labelFunction: function() {
          return gettextCatalog.getString('Lieferplanung verrechnen');
        },
        confirmMessage: gettextCatalog.getString('Soll die Lieferplanung verrechnet werden?'),
        noEntityText: true,
        iconClass: 'glyphicon glyphicon-chevron-right',
        onExecute: function() {
          return $scope.planungVerrechnen();
        }
      } ].concat($scope.getPostAbschliessenAktionen());

      $scope.verrechnetAction = [{
        label: gettextCatalog.getString('Lieferplanung verrechnet'),
        noEntityText: true,
        iconClass: 'glyphicon glyphicon-chevron-right',
        isDisabled: function() { return true; },
        onExecute: function() { }
      } ].concat($scope.getPostAbschliessenAktionen());

      msgBus.onMsg('EntityModified', $scope, function(event, msg) {
        if (msg.entity === 'Lieferplanung' && msg.entity
          .id === $routeParams.id) {
          $scope.$apply();
        }
      });

      msgBus.onMsg('EntityDeleted', $scope, function(event, msg) {
        if (msg.entity === 'Lieferplanung' && msg.data.id === $scope.planung.id) {
          $location.url('/lieferplanung');
         }
      });

      load();
    }
  ]);
