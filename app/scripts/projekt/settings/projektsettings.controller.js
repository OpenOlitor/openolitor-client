'use strict';

/**
*/
angular.module('openolitor-admin')
  .controller('ProjektSettingsController', ['$scope', '$filter',
    'NgTableParams',
    'KundentypenService',
    'KundentypenModel',
    'PersonCategoriesService',
    'PersonCategoriesModel',
    'ProduktekategorienService',
    'ProduktekategorienModel',
    'ProjektService',
    'ProjektModel',
    'OpenProjektModel',
    'KontoDatenService',
    'KontoDatenModel',    
    'EnumUtil',
    'FileSaver',
    'MONATE',
    'WAEHRUNG',
    'Upload',
    'msgBus',
    'cloneObj',
    'API_URL',
    function($scope, $filter, NgTableParams, KundentypenService,
      KundentypenModel, PersonCategoriesService, PersonCategoriesModel, ProduktekategorienService, ProduktekategorienModel,
      ProjektService, ProjektModel, OpenProjektModel, KontoDatenService, KontoDatenModel, EnumUtil, FileSaver, MONATE, WAEHRUNG,
      Upload, msgBus, cloneObj, API_URL
    ) {
      $scope.templateKundentyp = {};
      $scope.templatePersonCategory = {};
      $scope.templateProduktekategorie = {};

      var defaults = {
        modelPersonCategory: {
          name: '',
          description: '', 
          editable:true
        }
      };
      // first fake to true to work around bs-switch bug
      $scope.projectResolved = false;
      $scope.editMode = true;

      $scope.waehrungen = EnumUtil.asArray(WAEHRUNG);

      $scope.monate = EnumUtil.asArray(MONATE);

      $scope.tage = [];
      for (var i = 1; i <= 31; i++) {
        $scope.tage.push({
          id: i
        });
      }

      //watch for set of kundentypen
      $scope.$watch(KundentypenService.getKundentypen,
        function(list) {
          if (list) {
            $scope.kundentypen = [];
            angular.forEach(list, function(item) {
              if (item.id) {
                $scope.kundentypen.push(item);
              }
            });
            $scope.kundentypenTableParams.reload();
          }
        });

      //watch for set of PersonCategory
      $scope.$watch(PersonCategoriesService.getPersonCategories,
        function(list) {
          if (list) {
            $scope.personCategories = [];
            angular.forEach(list, function(item) {
              if (item.id) {
                $scope.personCategories.push(item);
              }
            });
            $scope.personCategoriesTableParams.reload();
          }
        });

      //watch for set of produktekategorien
      $scope.$watch(ProduktekategorienService.getProduktekategorien,
        function(list) {
          if (list) {
            $scope.produktekategorien = [];
            angular.forEach(list, function(item) {
              if (item.id) {
                $scope.produktekategorien.push(item);
              }
            });
            $scope.produktekategorienTableParams.reload();
          }
        });


      ProjektService.resolveProjekt().then(function(projekt) {
        if (projekt) {
          $scope.projekt = projekt;
          $scope.logoUrl = $scope.generateLogoUrl();
          $scope.editMode = false;
        } else {
          $scope.editMode = true;
        }
        $scope.projectResolved = true;
      }, function(error) {
        console.log('error', error);
      });

      KontoDatenService.resolveKontodaten().then(function(kontodaten) {
        if (kontodaten) {
          $scope.kontodaten = kontodaten;
        }
      }, function(error) {
        console.log('error', error);
      });

      $scope.switchToEditMode = function() {
        $scope.editMode = true;
      };

      $scope.changedKundentypen = {};
      $scope.deletingKundentypen = {};
      $scope.changedProduktekategorien = {};
      $scope.deletingProduktekategorien = {};
      $scope.modelChangedKundentyp = function(kundentyp) {
        if (!(kundentyp.kundentyp in $scope.changedKundentypen)) {
          $scope.changedKundentypen[kundentyp.id] = kundentyp;
        }
      };
      $scope.hasChangesKundentypen = function() {
        return Object.getOwnPropertyNames($scope.changedKundentypen).length >
          0;
      };

      $scope.changedPersonCategories = {};
      $scope.deletingPersonCategories = {};
      $scope.changedProduktekategorien = {};
      $scope.deletingProduktekategorien = {};
      $scope.modelChangedPersonCategory = function(personCategory) {
        if (!(personCategory.personCategory in $scope.changedPersonCategories)) {
          $scope.changedPersonCategories[personCategory.id] = personCategory;
        }
      };
      $scope.hasChangesPersonCategories = function() {
        return Object.getOwnPropertyNames($scope.changedPersonCategories).length >
          0;
      };
      $scope.modelChangedProduktekategorie = function(produktekategorie) {
        if (!(produktekategorie.produktekategorie in $scope.changedProduktekategorien)) {
          $scope.changedProduktekategorien[produktekategorie.id] =
            produktekategorie;
        }
      };

      $scope.hasChangesProduktekategorien = function() {
        return Object.getOwnPropertyNames($scope.changedProduktekategorien)
          .length > 0;
      };


            //watch for set of kundentypen
            $scope.$watch(KundentypenService.getKundentypen,
                function(list) {
                    if (list) {
                        $scope.kundentypen = [];
                        angular.forEach(list, function(item) {
                            if (item.id) {
                                $scope.kundentypen.push(item);
                            }
                        });
                        $scope.kundentypenTableParams.reload();
                    }
                });

            //watch for set of produktekategorien
            $scope.$watch(ProduktekategorienService.getProduktekategorien,
                function(list) {
                    if (list) {
                        $scope.produktekategorien = [];
                        angular.forEach(list, function(item) {
                            if (item.id) {
                                $scope.produktekategorien.push(item);
                            }
                        });
                        $scope.produktekategorienTableParams.reload();
                    }
                });


            ProjektService.resolveProjekt().then(function(projekt) {
                if (projekt) {
                    $scope.projekt = projekt;
                    $scope.logoUrl = $scope.generateLogoUrl();
                    $scope.editMode = false;
                } else {
                    $scope.editMode = true;
                }
                $scope.projectResolved = true;
            }, function(error) {
                console.log('error', error);
            });
          });
          return;
        }
        var newModel = new KundentypenModel({
          id: undefined,
          kundentyp: $scope.templateKundentyp.kundentyp
        });
        newModel.$save();
        $scope.templateKundentyp.creating = true;
        $scope.templateKundentyp.kundentyp = undefined;
      };


      $scope.savePersonCategories = function() {
        $scope.templatePersonCategory.creating = false;
        angular.forEach($scope.changedPersonCategories, function(personCategory) {
             var newPersonCategory = {
                name: personCategory.name,
                description: personCategory.description 
        };
        $scope.personCategory = new PersonCategoriesModel(newPersonCategory)
       
              $scope.personCategory.$save();
        });
      };

      $scope.deletingPersonCategory = function(personCategory) {
        return $scope.deletingPersonCategories[personCategory.personCategory];
      };

      $scope.deletePersonCategory = function(personCategory) {
        $scope.deletingPersonCategories[personCategory.personCategory] = true;
        personCategory.$delete();
      };

      $scope.addPersonCategory = function() {
        $scope.templatePersonCategory.creating = true;
        $scope.personCategory = cloneObj(defaults.modelPersonCategory);
        
          console.log("$scope.personCategories ");
        console.log($scope.personCategories);
        $scope.personCategories.push($scope.personCategory);
        $scope.personCategoriesTableParams.reload();
      };

      $scope.saveProduktekategorie = function() {
        if (!$scope.hasChangesProduktekategorien()) {
          return;
        }
        $scope.templateProduktekategorie.updating = true;
        angular.forEach($scope.changedProduktekategorien, function(
          produktekategorie) {
          produktekategorie.$save();
        });
      };

      $scope.deletingProduktekategorie = function(produktekategorie) {
        return $scope.deletingKundentypen[produktekategorie.id];
      };

            KontoDatenService.resolveKontodaten().then(function(kontodaten) {
                if (kontodaten) {
                    $scope.kontodaten = kontodaten;
                }
            }, function(error) {
                console.log('error', error);
            });

            $scope.switchToEditMode = function() {
                $scope.editMode = true;
            };

            //functions to save, cancel, modify or delete the kundentypen
            
            $scope.saveKundentyp = function(kundentyp) {
                kundentyp.editable = false;
                $scope.editingKundentypBool = false;
                $scope.kundentyp = new KundentypenModel(kundentyp);
                return $scope.kundentyp.$save();
            };

            $scope.cancelKundentyp = function(kundentyp) {
                if(kundentyp.isNew) {
                    var kundentypIndex = $scope.kundentypen.indexOf(kundentyp);
                    $scope.kundentypen.splice(kundentypIndex, 1);
                }
                if($scope.originalKundentyp) {
                    var isKundentypById = function (element) {
                        return kundentyp.id === element.id;
                    };
                    var originalKundentypIndex = $scope.kundentypen.findIndex(isKundentypById);
                    if(originalKundentypIndex >= 0) {
                        $scope.kundentypen[originalKundentypIndex] = $scope.originalKundentyp;
                    }
                    $scope.originalKundentyp= undefined;
                }
                kundentyp.editable = false;
                $scope.editingKundentypBool = false;
                $scope.kundentypenTableParams.reload();
            };

            $scope.editKundentyp = function(kundentyp) {
                $scope.originalKundentyp = cloneObj(kundentyp);
                kundentyp.editable = true;
                $scope.editingKundentypBool = true;
            };

            $scope.deleteKundentyp = function(kundentyp) {
                kundentyp.editable = false;
                $scope.kundentyp = new KundentypenModel(kundentyp);
                return $scope.kundentyp.$delete();
            };

            $scope.addKundentyp = function() {
                if(!$scope.editingKundentypBool) {
                    if(angular.isUndefined($scope.kundentypen)) {
                        $scope.kundentypen = [];
                    }
                    $scope.editingKundentypBool = true;
                    var newKundentyp = cloneObj(defaults.modelKundentyp);
                    $scope.editingKundentyp = newKundentyp;
                    $scope.editingKundentyp.isNew = true;
                    $scope.kundentypen.unshift(newKundentyp);
                    $scope.kundentypenTableParams.reload();
                }
            };

            //functions to save, cancel, modify or delete the produkteKategorie 
            
            $scope.saveProduktekategorie = function(produktekategorie) {
                produktekategorie.editable = false;
                $scope.editingProduktekategorieBool = false;
                $scope.produktekategorie = new ProduktekategorienModel(produktekategorie);
                return $scope.produktekategorie.$save();
            };

            $scope.cancelProduktekategorie = function(produktekategorie) {
                if(produktekategorie.isNew) {
                    var produktekategorieIndex = $scope.produktekategorien.indexOf(produktekategorie);
                    $scope.produktekategorien.splice(produktekategorieIndex, 1);
                }
                if($scope.originalProduktekategorie) {
                    var isProduktekategorieById = function (element) {
                        return produktekategorie.id === element.id;
                    };
                    var originalProduktekategorieIndex = $scope.produktekategorien.findIndex(isProduktekategorieById);
                    if(originalProduktekategorieIndex >= 0) {
                        $scope.produktekategorien[originalProduktekategorieIndex] = $scope.originalProduktekategorie;
                    }
                    $scope.produktekategorie = undefined;
                }
                produktekategorie.editable = false;
                $scope.editingProduktekategorieBool = false;
                $scope.produktekategorienTableParams.reload();
            };

            $scope.editProduktekategorie = function(produktekategorie) {
                $scope.originalProduktekategorie = cloneObj(produktekategorie);
                produktekategorie.editable = true;
                $scope.editingProduktekategorieBool = true;
            };

            $scope.deleteProduktekategorie = function(produktekategorie) {
                produktekategorie.editable = false
                $scope.produktekategorie = new ProduktekategorienModel(produktekategorie);
                return $scope.produktekategorie.$delete();
            };

            $scope.addProduktekategorie = function() {
                if(!$scope.editingProduktekategorieBool) {
                    if(angular.isUndefined($scope.produktekategorien)) {
                        $scope.produktekategorien = [];
                    }
                    $scope.editingProduktekategorieBool = true;
                    var newProduktekategorie = cloneObj(defaults.modelProduktekategorie);
                    $scope.editingProduktekategorie = newProduktekategorie;
                    $scope.editingProduktekategorie.isNew = true;
                    $scope.produktekategorien.unshift(newProduktekategorie);
                    $scope.produktekategorienTableParams.reload();
                }
            };

            if (!$scope.kundentypenTableParams) {
                //use default tableParams
                $scope.kundentypenTableParams = new NgTableParams({ // jshint ignore:line
                    page: 1,
                    count: 1000,
                    sorting: {
                        name: 'asc'
                    }
                }, {
                    filterDelay: 0,
                    groupOptions: {
                        isExpanded: true
                    },
                    getData: function(params) {
                        if (!$scope.kundentypen) {
                            return;
                        }
                        // use build-in angular filter
                        var orderedData = params.sorting ?
                            $filter('orderBy')($scope.kundentypen, params.orderBy()) :
                            $scope.kundentypen;

                        params.total(orderedData.length);
                        return orderedData;
                    }

                });
            }

        });
      }

      if (!$scope.personCategoriesTableParams) {
        //use default tableParams
        $scope.personCategoriesTableParams = new NgTableParams({ // jshint ignore:line
          page: 1,
          count: 1000,
          sorting: {
            name: 'asc'
          }
        }, {
          filterDelay: 0,
          groupOptions: {
            isExpanded: true
          },
          getData: function(params) {
            if (!$scope.personCategories) {
              return;
            }
            // use build-in angular filter
            var orderedData = params.sorting ?
              $filter('orderBy')($scope.personCategories, params.orderBy()) :
              $scope.personCategories;

            params.total(orderedData.length);
            return orderedData;
          }
        });
      }

      if (!$scope.produktekategorienTableParams) {
        //use default tableParams
        $scope.produktekategorienTableParams = new NgTableParams({ // jshint ignore:line
          page: 1,
          count: 1000,
          sorting: {
            name: 'asc'
          }
        }, {
          filterDelay: 0,
          groupOptions: {
            isExpanded: true
          },
          getData: function(params) {
            if (!$scope.produktekategorien) {
              return;
            }

            $scope.saveProjekt = function() {
                return $scope.kontodaten.$save().then($scope.projekt.$save(function(){
                    $scope.projektForm.$setPristine();
                }));
            };

            $scope.logoFile = undefined;
            // upload on file select or drop
            $scope.uploadLogo = function(file) {
                if (!file) {
                    return;
                }
                Upload.upload({
                    url: $scope.logoUrl,
                    data: {
                        file: file
                    }
                }).then(function() {
                    //regenerate logo url to reload image
                    $scope.logoUrl = $scope.generateLogoUrl();
                }, function(resp) {
                    console.log('Error status: ' + resp.status);
                });
            };

            $scope.generateLogoUrl = function() {
                return API_URL + 'projekt/' + $scope.projekt.id + '/logo';
            };

            $scope.downloadImportFile = function() {
                OpenProjektModel.fetchImportFile({
                }, function(file) {
                    FileSaver.saveAs(file.response, 'importFile' + '.ods');
                });
            };

            $scope.downloadStyle = function(style) {
                OpenProjektModel.fetchStyle({
                    style: style
                }, function(file) {
                    FileSaver.saveAs(file.response, style + '.css');
                });
            };

            $scope.uploadStyle = function(file, style) {
                if (!file) {
                    return;
                }
                Upload.upload({
                    url: API_URL + 'projekt/' + $scope.projekt.id + '/' + style,
                    data: {
                        file: file
                    }
                }).then(function() {
                    //regenerate logo url to reload image
                    $scope.logoUrl = $scope.generateLogoUrl();
                }, function(resp) {
                    console.log('Error status: ' + resp.status);
                });
            };

            $scope.localeBCP47Pattern = /^(((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+)|((en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang)))$/;

        }
    ]);
