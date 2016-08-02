'use strict';

/**
 * @ngdoc directive
 * @name lts2App.directive:ltsCarousel
 * @description
 * # A very simple AngularJS carousel directive
 */
angular.module('lts')
  .directive('ltsCarousel', ['$rootScope', '$timeout', '$window', 'ltsCarousels', '$location', '$q', function($rootScope, $timeout, $window, ltsCarousels, $location, $q) {
    return {
      scope: {
        options: '=ltsCarousel'
      },
      restrict: 'AC',
      controller: function($scope, $element) {
        $element.css({
          opacity: 0
        });

        var defaults = {
          name: 'carousel-' + Math.ceil((Math.random() * 1000000)).toString(),
          step: 1,
          index: 0,
          arrows: true,
          speed: 0.25,
          easing: 'linear',
          width: $element.parent().innerWidth() + 'px',
          height: 'auto',
          slides: 'li',
          zIndexSlides: 1,
          vertical: false,
          activeClass: 'active',
          wrap: false,
          btnStyle: {
            background: 'rgba(255,255,255,.6)'
          },
          zIndexBtn: 100,
          slideOffset: 0, //
          productsVisible: null,
          productCarousel: false
        };
        var offset = 0;
        var options = angular.extend(defaults, $scope.options || {});

        // Wrapper (only wrap on init)
        var wrapper = '<div></div>';
        var $wrapper = angular.element(wrapper).css({
          position: 'relative',
          left: 'calc(50% - (' + (options.width || $element.width()) + 'px / 2))',
          maxWidth: (options.width || $element.width()) + 'px',
          overflow: 'hidden'
          // Add height for non vertical carousels
        }).addClass('lts-carousel');
        $element.wrap($wrapper);

        // Original productsVisible
        if (options.productsVisible != null) {
          options.productsVisibleCopy = options.productsVisible;
        }

        if (options.vertical) {
          $element.css({
            maxHeight: options.height
          });
        }

        $scope.build = function() {
          return $q(function(resolve) {
            options.nextButton = options.vertical ? '<div class="next-btn"><span class="sprite sprite-chevron-bold-down"></span></div>' : '<div class="next-btn"><span class="sprite sprite-chevron-bold-right"></span></div>';
            options.prevButton = options.vertical ? '<div class="prev-btn"><span class="sprite sprite-chevron-bold-up"></span></div>' : '<div class="prev-btn"><span class="sprite sprite-chevron-bold-left"></span></div>';

            // Re-evaluate options
            options.width = options.width > 0 ? options.width : $element.parent().outerWidth(true) + 'px';
            options.height = $element.parent().outerHeight(true) + 'px';
            options = angular.extend(defaults, $scope.options || {});

            // Update wrapper
            $scope.$wrapper = $element.parent();
            $scope.$wrapper.css({
              position: 'relative',
              left: 'calc(50% - (' + (options.width || $element.outerWidth(true)) + 'px / 2))',
              overflow: options.vertical ? 'visible' : 'hidden',
              height: options.vertical ? 'auto' : $element.children(':first').height()
            });

            // Slides
            $scope.$slides = $element.children();

            // Normalise index
            if (options.index > $scope.$slides.length - options.productsVisible) {
              options.index = $scope.$slides.length - options.productsVisible;
              $scope.build();
            }

            $scope.$slides.css({
              position: 'relative',
              float: 'left',
              display: 'inline-block',
              width: options.vertical ? '100%' : options.width,
              transition: (options.vertical ? 'top' : 'left') + ' ' + options.speed + 's ' + options.easing,
              zIndex: options.zIndexSlides
            });

            // Product carousel slides
            if (options.productCarousel) {
              if ($window.innerWidth < 769) {
                options.productsVisible = 2;
              } else if ($window.innerWidth > 769 && $window.innerWidth < 992) {
                options.productsVisible = 3;
              } else {
                options.productsVisible = options.productsVisibleCopy;
              }

              var slideWidth = $scope.$wrapper.width() / options.productsVisible;
              $scope.$slides.css('width', slideWidth + 'px');
            }

            // Carousel
            $element.css({
              minWidth: '100%',
              opacity: 1,
              overflow: options.vertical ? 'hidden' : 'visible'
            });
            if (!options.vertical) {
              var width = 0;
              for (var i = 0; i < $scope.$slides.length; i++) {
                width += angular.element($scope.$slides[i]).outerWidth(true);
              }
              $element.css({
                width: $scope.$slides.length < 2 ? width + 'px' : 1.5 * width + 'px' // allow enough room for the slides
              });
            } else {
              var initHeight = 0,
                updateHeight = null;
              for (var i = 0; i < $scope.$slides.length; i++) {
                if (i === options.productsVisible) {
                  break;
                }

                initHeight += parseInt(angular.element($scope.$slides[i]).outerHeight(true));
                $element.css({
                  maxHeight: initHeight + 'px'
                });
              }
            }

            // Next/prev buttons
            if ($scope.prevButtonWrap) {
              $scope.prevButtonWrap.remove();
            }
            $scope.prevButton = angular.element(options.prevButton);
            $scope.prevButton
              .css(angular.extend(defaults.btnStyle, {
                textAlign: 'center',
                padding: options.vertical ? 0 : '2em 1em'
                // display: 'none'
              }))
              .bind('click', function() {
                $scope.slideTo('prev');
              });
            $scope.prevButtonWrap = angular.element('<div class="btn-prev-wrap"></div>');
            $scope.prevButtonWrap
              .css({
                position: options.vertical ? null : 'absolute',
                top: options.vertical ? 0 : 'calc(50% - 2.5em)',
                left: 0,
                right: options.vertical ? null : 0,
                bottom: options.vertical ? null : 0,
                marginTop: 0,
                width: options.vertical ? '100%' : '3em',
                height: options.vertical ? '3em' : '5em',
                lineHeight: options.vertical ? '3em' : (options.height || $element.height()) + 'px',
                zIndex: options.zIndexBtn,
                 display: 'none'
              });
            $scope.prevButtonWrap.append($scope.prevButton);
            $element.parent().before($scope.prevButtonWrap);
            if ($scope.nextButtonWrap) {
              $scope.nextButtonWrap.remove();
            }
            $scope.nextButton = angular.element(options.nextButton);
            $scope.nextButton
              .css(angular.extend(defaults.btnStyle, {
                textAlign: 'center',
                padding: options.vertical ? 0 : '2em 1em'
                // display: 'none'
              }))
              .bind('click', function() {
                $scope.slideTo('next');
              });
            $scope.nextButtonWrap = angular.element('<div class="btn-next-wrap"></div>');
            $scope.nextButtonWrap
              .css({
                position: options.vertical ? null : 'absolute',
                top: options.vertical ? null : 'calc(50% - 2.5em)',
                left: options.vertical ? 0 : null,
                right: 0,
                bottom: 0,
                marginTop: 0,
                height: options.vertical ? '3em' : '5em',
                lineHeight: options.vertical ? '3em' : (options.height || $element.height()) + 'px',
                zIndex: options.zIndexBtn,
                display: 'none'
              });
            $scope.nextButtonWrap.append($scope.nextButton);
            $element.parent().after($scope.nextButtonWrap);

            // Navigation
            var normalise = function(index) {
              if (index < 0) {
                index = options.wrap ? $scope.$slides.length - 1 : 0;
              }
              if (index >= $scope.$slides.length) {
                index = options.wrap ? index % $scope.$slides.length : $scope.$slides.length - 1;
              }
              return index;
            };

            var toggleArrows = function() {
              var prevQuery = (options.wrap && $scope.$slides.length > 1) || options.index > 0 ? 'show' : 'hide';
              // Prev arrow
              $scope.prevButtonWrap[prevQuery]();
              // Next arrow will hide when the last slide is visible
              var pixels = 0;
              var dimension = options.vertical ? 'outerHeight' : 'outerWidth';

              for (var i = options.index; i < $scope.$slides.length; i++) {
                pixels += angular.element($scope.$slides[i])[dimension](true);
              }

              var nextQuery = (options.wrap && $scope.$slides.length > 1) || pixels > (options.vertical ? initHeight || options.height : ($element.parent().width())) ? 'show' : 'hide';
              $scope.nextButtonWrap[nextQuery]();
            };

            // Update vertical Carousels
            var updatedHeight = function() {
              if (options.vertical) {
                var updateHeight = 0;
                for (var i = options.index; i < $scope.$slides.length; i++) {
                  if(i === options.productsVisible + options.index) {
                    break;
                  }

                  updateHeight += parseInt(angular.element($scope.$slides[i]).outerHeight(true));
                  $element.css({maxHeight: updateHeight + 'px'});
                  initHeight = updateHeight;
                }
              }
            };

            $scope.slideTo = function(slide) {
              // Disable arrows while in transition
              if ($scope.nextButton || options.index === ($scope.$slides.length - 1)) {
                $scope.nextButton.css('pointer-events', 'none');
                $timeout(function() {
                  $scope.nextButton.css('pointer-events', 'auto');
                }, options.speed * 1000);
              }

              var currentIndex = options.index;
              switch (slide) {
                case 'next':
                  options.index++;
                  break;
                case 'prev':
                case 'previous':
                  slide = 'prev';
                  options.index--;
                  break;
                default:
                  options.index = slide;
              }

              options.index = normalise(options.index);
              // Apply classes
              $scope.$slides.removeClass(options.activeClass);
              angular.element($scope.$slides[options.index]).addClass(options.activeClass);
              // Calculate offset
              var offsetSize = options.vertical ? 'outerHeight' : 'outerWidth';
              var offsetDirection = options.vertical ? 'top' : 'left';

              if (options.index > 0) {
                offset = 0;
                for (var i = 0; i < options.index; i++) {
                  offset += angular.element($scope.$slides[i])[offsetSize](true);
                  offset = offset + options.slideOffset;
                }
              } else {
                offset = 0;
              }
              $scope.$slides.css(offsetDirection, -offset + 'px');

              $timeout(function() {
                $rootScope.$broadcast('carouselResize');
              }, 300);
              
              updatedHeight();
              toggleArrows();
            };

            $timeout(function() {
              $scope.slideTo(options.index);
              // Register
              ltsCarousels.register(options.name, {
                scope: $scope,
                elem: $element,
                options: options
              });
              resolve();
              if (angular.isFunction(ltsCarousels.callback)) {
                ltsCarousels.callback($element);
              }
            });
          });
        };

        angular.element($window).bind('load resize', $scope.build);
        $scope.$on('wishlistRefresh', $scope.build);
        $scope.$on('$viewContentRendered', $scope.build);

        // Listen for orientation changes
        window.addEventListener('orientationchange', function() {
          $scope.build();
        }, false);

        $timeout(function() {
          $scope.build();

          var img = $element.find('img');
          angular.forEach(img, function() {
            img.bind('load', $scope.build);
          });
        }, 150); // This is for all browsers

        return $scope;
      }
    };
  }]);

angular.module('lts')
  .directive('ltsCarouselItem', ['$timeout', 'ltsCarousels', function($timeout, ltsCarousels) {
    return {
      restrict: 'AC',
      require: '^ltsCarousel',
      scope: {
        index: '=ltsCarouselItem'
      },
      link: function(scope, elem, attrs) {
        elem.bind('click', function() {
          var $carousel = ltsCarousels.get(attrs.ltsCarouselTarget);
          if ($carousel) {
            $carousel.scope.slideTo(scope.index);
          }
        });
      }
    };
    }]);

angular.module('lts')
  .service('ltsCarousels', ['$q', function($q) {
    var carousels = {};
    var api = {
      register: function(name, carousel) {
        carousels[name] = carousel;
      },
      get: function(name) {
        return carousels[name];
      },
      render: function(name) {
        return $q(function(resolve, reject) {
          if (name) {
            var carousel = api.get(name);
            if (carousel) {
              carousel.scope.build().then(function() {
                resolve(carousel);
              });
            } else {
              reject('no carousel found');
            }
          } else if (angular.isFunction(resolve)) {
            // Global callback
            api.callback = resolve;
          }
        });
      }
    };
    return api;
    }]);