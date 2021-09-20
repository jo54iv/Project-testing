/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-redeclare */
/* eslint-disable no-case-declarations */
'use strict';

import Cookies from 'js-cookie';
import slick from 'slick-carousel';
import 'moment';
import 'air-datepicker';
import mapboxgl from 'mapbox-gl';

var home = {
  cookies: Cookies,
  page: 0,
  pageMax: 0,
  limit: 14,
  max: 0,
  count: 0,
  cat: '',
  sort: 'rand',
  post_rotate: 0,
  posts: Array(),
  pattern: [
    'big-left',
    'left-right',
    'big-right',
    'slider',
    'big-center',
    'big-last',
  ],
  parallax: null,
  active_bar: {
    left: 0,
    width: 0,
  },
  mobile_active_bar: {
    left: 0,
    width: 0,
  },
  // eventsSimpleBar: undefined,
  map: {
    posts: Array(),
    page: 1,
    limit: 10,
    max: 0,
    count: 0,
    mapFeatures: Array(),
  },
  events: {
    posts: Array(),
    page: 1,
    limit: 10,
    max: 0,
    count: 0,
  },
  eventsUpcoming: {
    active: false,
    posts: Array(),
    page: 1,
    limit: 10,
    max: 0,
    count: 0,
  },
  // locationsSimpleBar: undefined,
  categories: [],
  mapBox: undefined,
  geojson: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [-81.7822265625, 28.5941685062326],
        },
      },
    ],
  },
  datePickerDate: new Date(),
  chosenTags: Array(),
  lastScrollPosition: 0,

  getTopTags: () => {
    // Get User Tags
    // var Cookies2 = Cookies.noConflict()

    // var userTags = Cookies2.get('lake_nona_categorytags') != undefined ? JSON.parse(Cookies2.get('lake_nona_categorytags')) : {};
    // var userTagsSorted = Object.keys(userTags).sort(function (a, b) { return userTags[b] - userTags[a] })

    // userTagsSorted.forEach((tag, index) => {
    //     if (home.chosenTags.indexOf(tag) < 0) {
    //         home.chosenTags.push(tag);
    //     }

    //     if (index > 3) {
    //         return;
    //     }

    // });

    $(document).on('click', '.tags .tag', function(event) {
      event.preventDefault();
      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        home.chosenTags.splice(
          home.chosenTags.indexOf($(this).data('slug')),
          1,
        );
      } else {
        $(this).addClass('active');
        home.chosenTags.push($(this).data('slug'));
      }
      home.resetPosts();
      home.getMax(home.cat);

      home.loadMapPosts();

      var date = home.datePicker.selectedDates[0];
      home.getMaxEvents(
        moment(date).format('Y'),
        moment(date).format('MM'),
        moment(date).format('DD'),
      );
    });
  },



  categorySlider: () => {
    $('header .category-slider').slick({
      infinite: true,
      speed: 600,
      autoplay: false,
      variableWidth: false,
      dots: true,
      arrows: false,
      cssEase: 'ease-in-out',
      fade: true,
      responsive: [
        {
          breakpoint: 991,
          settings: {
            swipe: true,
          },
        },
      ],
    });
  },

  introSlider: () => {
    $('.intro .intro-slider').slick({
      infinite: true,
      speed: 600,
      autoplay: false,
      variableWidth: false,
      dots: false,
      adaptiveHeight: true,
      swipe: false,
      cssEase: 'ease-in-out',
      fade: true,
      responsive: [
        {
          breakpoint: 991,
          settings: {
            swipe: true,
            asNavFor: 'header .category-slider',
          },
        },
      ],
    });

    $('.intro').addClass('show');
  },

  featuredSlider: () => {
    $('.featured-posts .featured-slider').slick({
      infinite: false,
      speed: 600,
      autoplay: false,
      variableWidth: false,
      dots: false,
      adaptiveHeight: true,
      slidesToShow: 3,
      slidesToScroll: 3,
      responsive: [
        {
          breakpoint: 991,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: false,
            dots: true,
            arrows: false,
          },
        },
      ],
    });
  },

  filterBar: () => {
    $('.filter-bar .filter-btn').on('click', function(event) {
      let view = $(this).data('view');
      if (view != 'filters') {
        $('.filter-bar .filter-btn:not(.filters)').removeClass('active');
        $(this).addClass('active');
        $('#views .slide').removeClass('is-showing');
        $(`#views #${view}`).addClass('is-showing');
        $('html, body').animate(
          {
            scrollTop: $('#filters').offset().top - 80,
          },
          'slow',
        );
      } else {
        $('.filter-btn[data-view="filters"]').toggleClass('active');
        $('.tags').toggleClass('active');
      }
      switch (view) {
        case 'map':
          if (home.map.posts.length == 0) {
            home.loadMapPosts();
          }

          break;
        case 'events':
          if (home.events.posts.length == 0) {
            home.getMaxEvents(
              moment().format('Y'),
              moment().format('MM'),
              moment().format('D'),
            );
          }

          break;

        default:
          break;
      }
      $('.featured-posts .featured-slider').slick('resize');

      $('.featured-posts .featured-slider').slick('refresh');
    });
  },

  mapView: function() {
    // Location results
    // home.locationsSimpleBar = new SimpleBar($('#map-list .results')[0], {
    //   forceVisible: true,
    // });

    mapboxgl.accessToken =
      'this-is-where-the-token-key-goes';
    let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(
      navigator.userAgent,
    );
    let bounds = [-180, 90, 0, 0];
    home.mapBox = new mapboxgl.Map({
      container: 'mapbox', // container id
      style: 'mapbox://styles/321dev/ck7lysyji10ft1imztfweg1t8', // stylesheet location
      center: [-81.262989, 28.381124], // starting position [lng, lat]
      //center: [-122.42116928100586, 37.77532815168286],
      zoom: 12, // starting zoom
      maxZoom: 17,
      minZoom: 12,
      //dragPan: (isMobile) ? false : true
    });

    home.mapBox.addControl(new mapboxgl.NavigationControl());

    home.mapBox.loadImage(STATIC_URL + '/img/global/icon-pin.png', function(
      error,
      image,
    ) {
      if (error) throw error;
      home.mapBox.addImage('pin', image);
    });

    var popup;

    // When a click event occurs on a feature in the places layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    home.mapBox.on('click', 'places', function(e) {
      var coordinates = e.features[0].geometry.coordinates.slice();
      var description = e.features[0].properties.description;

      if (description != undefined) {
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(description)
          .addTo(home.mapBox);
      } else {
        var currentZoom = home.mapBox.getZoom();
        home.mapBox.zoomTo(currentZoom + 1);
        home.mapBox.flyTo({
          center: coordinates,
          zoom: currentZoom + 1,
        });
      }
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    home.mapBox.on('mouseenter', 'places', function(e) {
      home.mapBox.getCanvas().style.cursor = 'pointer';

      var coordinates = e.features[0].geometry.coordinates.slice();
      var description = e.features[0].properties.description;

      if (description != undefined) {
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        popup = new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(description)
          .addTo(home.mapBox);
      }
    });

    // Change it back to a pointer when it leaves.
    home.mapBox.on('mouseleave', 'places', function() {
      home.mapBox.getCanvas().style.cursor = '';
      if (popup != undefined) {
        popup.remove();
      }
    });

    // Mask
    // var mask = turf.polygon([
    //   [
    //     [-81.28057271002459, 28.448349691569177],
    //     [-81.27802243490478, 28.44830777901001],
    //     [-81.27683071755942, 28.44830777901001],
    //     [-81.27442344852146, 28.44830777901001],
    //     [-81.2710866399535, 28.44830777901001],
    //     [-81.26834569005847, 28.44830777901001],
    //     [-81.26460369759332, 28.448286822724214],
    //     [-81.2631021337376, 28.446086389585048],
    //     [-81.26217259420811, 28.444766107726764],
    //     [-81.2610523799034, 28.442963791600903],
    //     [-81.26069486469963, 28.442460814177565],
    //     [-81.25988449690475, 28.441224317846462],
    //     [-81.2593124725785, 28.440406964878704],
    //     [-81.25885961998702, 28.43971535358756],
    //     [-81.25845443608931, 28.439044695898033],
    //     [-81.25814458957949, 28.438583616270392],
    //     [-81.25795391480425, 28.438080618020578],
    //     [-81.25771557133508, 28.4376195341913],
    //     [-81.25754873090655, 28.43699078027619],
    //     [-81.25742955917195, 28.436299146653496],
    //     [-81.2573580561313, 28.435460796808485],
    //     [-81.25719121570329, 28.43225404735405],
    //     [-81.2571626544422, 28.4315456105043],
    //     [-81.25709327391009, 28.430671097137264],
    //     [-81.25702389337745, 28.43032535730137],
    //     [-81.25681575178113, 28.42969488763363],
    //     [-81.2566307370287, 28.429267793144277],
    //     [-81.25619132699119, 28.428555965164932],
    //     [-81.25589067801839, 28.42825089456545],
    //     [-81.25542814113754, 28.42774244161214],
    //     [-81.25482684319144, 28.42725432447891],
    //     [-81.2471817981347, 28.42118856832184],
    //     [-81.24598463837847, 28.42025956198428],
    //     [-81.24542126908109, 28.41978473337548],
    //     [-81.24481095234273, 28.41928925777347],
    //     [-81.24444350015469, 28.418870645890166],
    //     [-81.24429369981058, 28.41868243402861],
    //     [-81.24375869858027, 28.417929583236855],
    //     [-81.24341629779305, 28.41691322617784],
    //     [-81.24326649744847, 28.416235649385342],
    //     [-81.24314826789072, 28.41543144183514],
    //     [-81.24319324328012, 28.41473919602275],
    //     [-81.24314826789072, 28.413868937724956],
    //     [-81.24321573097461, 28.41303822995114],
    //     [-81.24316714427172, 28.412375203390184],
    //     [-81.2431900833803, 28.411628688859537],
    //     [-81.24325890070646, 28.41106375544628],
    //     [-81.24341947446794, 28.41011546758679],
    //     [-81.24367197998878, 28.408953783183136],
    //     [-81.24382084128425, 28.408224288123364],
    //     [-81.24418236157267, 28.40654081881047],
    //     [-81.24426742517022, 28.405848718111017],
    //     [-81.244458818264, 28.40440838594317],
    //     [-81.2445651477607, 28.40334215341403],
    //     [-81.24465021135826, 28.402519089386104],
    //     [-81.24475654085495, 28.40193919952752],
    //     [-81.24476491653574, 28.401376745629662],
    //     [-81.24476491653574, 28.40063700910622],
    //     [-81.24482020270561, 28.39954211718414],
    //     [-81.24479541513037, 28.399052289958078],
    //     [-81.24477123744772, 28.398563123577404],
    //     [-81.24472288208186, 28.397882540507723],
    //     [-81.24462617135015, 28.396819120713047],
    //     [-81.24455363830161, 28.396032183194023],
    //     [-81.24455363830161, 28.39490493819123],
    //     [-81.24454325967636, 28.39366723810491],
    //     [-81.24462411621094, 28.38808341859773],
    //     [-81.24462411621094, 28.38577156010024],
    //     [-81.24462411621094, 28.384971289644852],
    //     [-81.24460390207754, 28.38360192396722],
    //     [-81.24464433034437, 28.38265936329084],
    //     [-81.24468475861124, 28.374601596134326],
    //     [-81.24472518687664, 28.36938471076006],
    //     [-81.24470497274324, 28.368121863978843],
    //     [-81.24476561514396, 28.365720634978473],
    //     [-81.24476522731621, 28.36470779022065],
    //     [-81.24474501318234, 28.364316469944498],
    //     [-81.24466415664764, 28.3635693999544],
    //     [-81.24453189143645, 28.362822324708276],
    //     [-81.24443082076843, 28.362448785112292],
    //     [-81.24416803703164, 28.361630550926975],
    //     [-81.24380418262682, 28.360670007094868],
    //     [-81.26589823065291, 28.360865674135866],
    //     [-81.26596736522787, 28.3597748916647],
    //     [-81.26649020905037, 28.359044854678345],
    //     [-81.26708270220517, 28.35860246473584],
    //     [-81.26740267261357, 28.358352100542106],
    //     [-81.26852256904017, 28.35775766897119],
    //     [-81.26914473372186, 28.357569953047133],
    //     [-81.26974912226989, 28.357225806322248],
    //     [-81.27087458999722, 28.357162922782393],
    //     [-81.27245431499752, 28.35708392726238],
    //     [-81.27348786838064, 28.35708392726292],
    //     [-81.2749059406261, 28.357068128939943],
    //     [-81.27657373901813, 28.357307225428713],
    //     [-81.27869497817272, 28.357610363699848],
    //     [-81.27965670023221, 28.358228823311038],
    //     [-81.28079020356786, 28.359188092681862],
    //     [-81.28128216941367, 28.35995403170098],
    //     [-81.28154707409948, 28.360520156988372],
    //     [-81.28181197878573, 28.36105297803023],
    //     [-81.28203903994489, 28.36178560259596],
    //     [-81.28241747521068, 28.362351718114866],
    //     [-81.32568911788522, 28.360853170450937],
    //     [-81.32667304957599, 28.360353649861963],
    //     [-81.32845169532504, 28.35992073011677],
    //     [-81.32939778348955, 28.359554412030306],
    //     [-81.33140349039778, 28.35898828159131],
    //     [-81.33329566672641, 28.35838884607098],
    //     [-81.33488509484258, 28.358322241915175],
    //     [-81.33571765242709, 28.35838884607098],
    //     [-81.33692864527745, 28.358721866222467],
    //     [-81.33772335933531, 28.358888375906446],
    //     [-81.33836669928736, 28.35898828159131],
    //     [-81.33916141334524, 28.35898828159131],
    //     [-81.33893435218565, 28.36784621184249],
    //     [-81.33889650865898, 28.37487208929079],
    //     [-81.31134642131443, 28.374905386180828],
    //     [-81.29382486851088, 28.37467230773416],
    //     [-81.29317406405063, 28.374699794603515],
    //     [-81.29236295602722, 28.374789002103],
    //     [-81.29161944033856, 28.374878209527424],
    //     [-81.29074073997968, 28.375145831350608],
    //     [-81.2823592904024, 28.378595118864027],
    //     [-81.28241139488044, 28.403322133534743],
    //     [-81.28248329058518, 28.415729817505223],
    //     [-81.28174036825943, 28.41575089535874],
    //     [-81.28118916782456, 28.41575089535874],
    //     [-81.28078175880782, 28.41579305105327],
    //     [-81.2805181412087, 28.416067062661213],
    //     [-81.28037434979055, 28.416235684836863],
    //     [-81.28025452360902, 28.416572928381797],
    //     [-81.28023055837293, 28.416973403695906],
    //     [-81.28057271002459, 28.448349691569177],
    //   ],
    // ]);

    home.mapBox.on('load', function() {
      // home.mapBox.addSource('mask', {
      //     "type": "geojson",
      //     "data": polyMask(mask, bounds)
      // });
      // home.mapBox.addLayer({
      //     "id": "zmask",
      //     "source": "mask",
      //     "type": "fill",
      //     "paint": {
      //         "fill-color": "white",
      //         'fill-opacity': 0.75
      //     }
      // });
    });

    // function polyMask(mask, bounds) {
    //   var bboxPoly = turf.bboxPolygon(bounds);
    //   return turf.difference(bboxPoly, mask);
    // }

    // Draw Points
    // var draw = new MapboxDraw({
    //     displayControlsDefault: false,
    //     controls: {
    //         polygon: true,
    //         trash: true
    //     }
    // });
    // home.mapBox.addControl(draw);

    // home.mapBox.on('draw.create', updateArea);
    // home.mapBox.on('draw.delete', updateArea);
    // home.mapBox.on('draw.update', updateArea);

    // function updateArea(e) {
    //     console.dir(e.features[0].geometry.coordinates[0]);
    //     var data = draw.getAll();
    //     var answer = document.getElementById('calculated-area');
    //     if (data.features.length > 0) {
    //         var area = turf.area(data);
    //         // restrict to area to 2 decimal points
    //         // var rounded_area = Math.round(area * 100) / 100;
    //         // answer.innerHTML =
    //         //     '<p><strong>' +
    //         //     rounded_area +
    //         //     '</strong></p><p>square meters</p>';
    //     } else {
    //         // answer.innerHTML = '';
    //         // if (e.type !== 'draw.delete')
    //         //     alert('Use the draw tools to draw a polygon!');
    //     }
    // }
  },

  getCategories: () => {
    $('.category-bar ul li').each(function(index, element) {
      // element == this
      home.categories.push($(element).data('cat'));
    });
  },

  categoryBar: () => {
    var firstCategory = $('nav .category-bar ul li').first();
    var activeBar = $('nav .category-bar ul .active-bar');

    $(activeBar).unbind('mouseenter mouseleave');

    home.active_bar.left = $(firstCategory).position().left;
    // home.active_bar.width = $(firstCategory).outerWidth(true);

    $(activeBar).css({
      left: home.active_bar.left,
      width: home.active_bar.width,
    });

    $('nav .category-bar ul li').hover(
      function() {
        // over

        $(activeBar).css({
          left: $(this).position() .left
          // width: $(this).outerwidth(true),
        });
      },
      function() {
        // out

        $(activeBar).css({
          left: home.active_bar.left,
          width: home.active_bar.width,
        });
      },
    );
  },

  mobileCategoryBar: () => {
    var firstCategory = $('header .category-bar ul li').first();
    var activeBar = $('header .category-bar ul .active-bar');

    $(activeBar).unbind('mouseenter mouseleave');

    home.mobile_active_bar.left = $(firstCategory).position().left;
    home.mobile_active_bar.width = $(firstCategory).outerWidth(true);

    $(activeBar).css({
      left: home.mobile_active_bar.left,
      width: home.mobile_active_bar.width,
    });

    $('header .category-bar ul li').hover(
      function() {
        // over

        $(activeBar).css({
          left: $(this).position() .left
          // width: $(this).outerwidth(true),
        });
      },
      function() {
        // out

        $(activeBar).css({
          left: home.mobile_active_bar.left,
          width: home.mobile_active_bar.width,
        });
      },
    );
  },

  setCategory: (cat) => {
    home.resetPosts();

    var nav_item = $(`nav .category-bar ul li[data-cat="${cat}"]`);
    var activeBar = $('nav .category-bar ul .active-bar');
    nav_item.addClass('active');

    home.active_bar.left = $(nav_item).position().left;
    // home.active_bar.width = $(nav_item).outerWidth(true);

    $(activeBar).css({
      left: $(nav_item).position() .left
      // width: $(nav_item).outerwidth(true),
    });

    var nav_item = $(`header .category-bar ul li[data-cat="${cat}"]`);
    var activeBar = $('header .category-bar ul .active-bar');
    nav_item.addClass('active');

    home.active_bar.left = $(nav_item).position().left;
    // home.active_bar.width = $(nav_item).outerWidth(true);

    $(activeBar).css({
      left: $(nav_item).position() .left
      // width: $(nav_item).outerwidth(true),
    });

    if (cat == 'discover') {
      home.getMax();
    } else {
      home.getMax(cat);
    }
  },

  lastPostItem: () => {
    var last = $('.content-wrap')
      .children()
      .last();
    last.addClass('last-element');
  },

  handleBarsHelpers: () => {
    Handlebars.registerHelper('ifevent', function(conditional, options) {
      if (conditional == 'event') {
        return options.fn(this);
      }
    });

    Handlebars.registerHelper('ifplace', function(conditional, options) {
      if (conditional == 'thing_place' || conditional == 'event') {
        return options.fn(this);
      }
    });

    Handlebars.registerHelper('formatEventDate', function(options) {
      var input = options.fn(this);
      var formatted = moment(input).format('dddd MMMM DD');
      return formatted;
    });

    Handlebars.registerHelper('formatEventTime', function(options) {
      var input = options.fn(this);
      var formatted = moment(input).format('hh:mm a');
      return formatted;
    });

    Handlebars.registerHelper('excerpt', function(options) {
      var excerpt = $('<textarea />')
        .html(options.fn(this))
        .text();
      excerpt = excerpt.replace('[', '<span class="ellipsis">');
      excerpt = excerpt.replace(']', '</span>');
      return excerpt;
    });

    Handlebars.registerHelper('getDay', function(options) {
      var input = options.fn(this);
      var formatted = moment(input).format('DD');
      return formatted;
    });

    Handlebars.registerHelper('getMonth', function(options) {
      var input = options.fn(this);
      var formatted = moment(input).format('MMM');
      return formatted;
    });
  },

  resetPosts: () => {
    $('#list .results .post').removeClass('fadeInUp');
    home.count = 0;
    home.page = 0;
    home.pageMax = 0;
    home.posts = Array();

    $('#list .results').html('');
  },

  loadPosts: (cat) => {
    if (home.count < home.max) {
      $('#list .results').addClass('loading');

      var userTags =
        home.cookies.get('lake_nona_tags') != undefined
          ? JSON.parse(home.cookies.get('lake_nona_tags'))
          : {};

      var sortable = [];
      for (var userTag in userTags) {
        sortable[userTag] = userTags[userTag];
      }

      sortable.sort(function(a, b) {
        return a - b;
      });

      var userTagsArray = [];

      for (var sortedItem in sortable) {
        userTagsArray.push(sortedItem);
      }

      var dataObject = {
        action: 'nona_category_results',
        security: AJAX_NONCE,
        page: home.page,
        limit: home.limit,
        sort: home.sort == undefined ? 'rand' : home.sort,
        tags: home.chosenTags,
        user_tags: userTagsArray.slice(0, 3),
      };

      if (CATEGORY) {
        dataObject.category = CATEGORY;
      }

      $.ajax({
        type: 'POST',
        url: AJAX_URL,
        data: dataObject,
        dataType: 'json',
        success: function(response) {
          home.count += response.data.count;

          home.posts = home.chunk(response.data.posts, 6);

          home.pageMax = home.posts.length - 1;

          home.posts[home.page].forEach((entry, index) => {
            switch (home.pattern[index]) {
              case 'big-left':
                var source = document.getElementById('big-post-left-template')
                  .innerHTML;
                var template = Handlebars.compile(source);
                var html = template({
                  post: entry,
                });

                $('#list .results').append(html);
                break;

              case 'big-right':
                var source = document.getElementById('big-post-right-template')
                  .innerHTML;
                var template = Handlebars.compile(source);
                var html = template({
                  post: entry,
                });

                $('#list .results').append(html);
                break;

              case 'left-right':
                let row = $('<div class="row"></div>');
                for (let i = 0; i < entry.length; i += 1) {
                  var source = document.getElementById('sides-post-template')
                    .innerHTML;
                  var template = Handlebars.compile(source);
                  var html = template({
                    post: entry[i],
                    size: i == 0 ? 7 : 5,
                  });

                  row.append(html);
                }
                $('#list .results').append(row);
                break;

              case 'slider':
                var source = document.getElementById('posts-slider-template')
                  .innerHTML;
                var template = Handlebars.compile(source);
                var html = template({
                  slide: entry,
                });
                //console.log(entry);
                $('#list .results').append(html);

                $('.posts-slider').each(function(index, element) {
                  if (!$(element).hasClass('slick-slider')) {
                    $(element).slick({
                      infinite: false,
                      speed: 600,
                      autoplay: false,
                      variableWidth: false,
                      dots: false,
                      adaptiveHeight: false,
                      slidesToShow: 4,
                      slidesToScroll: 4,
                      responsive: [
                        {
                          breakpoint: 991,
                          settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1,
                            infinite: false,
                            dots: true,
                            arrows: false,
                            variableWidth: true,
                          },
                        },
                      ],
                    });
                  }
                });

                break;

              case 'big-center':
                var source = document.getElementById('big-post-center-template')
                  .innerHTML;
                var template = Handlebars.compile(source);
                var html = template({
                  post: entry,
                });

                $('#list .results').append(html);
                break;

              case 'big-last':
                var source = document.getElementById('big-post-last-template')
                  .innerHTML;
                var template = Handlebars.compile(source);
                var html = template({
                  post: entry,
                });

                $('#list .results').append(html);
                break;

              default:
                break;
            }
          });

          $('#list .results').removeClass('loading');

          $('#list .post').each(function(index, element) {
            // element == this
            if (!$(element).hasClass('fadeInUp')) {
              setTimeout(() => {
                $(element).addClass('fadeInUp');
              }, 100 * index);
            }
          });

          if (home.page >= home.pageMax) {
            $('#load-more').addClass('d-none');
          } else {
            $('#load-more').removeClass('d-none');
          }

          home.page += 1;

          home.parallax.reInit();
        },
      });
    }
  },
  loadMapPosts: () => {
    $('#map-list .post').removeClass('fadeOutDownBig');
    $('#map-list .results').addClass('loading');

    var dataObject = {
      action: 'nona_category_map_results',
      security: AJAX_NONCE,
      page: 1,
      limit: -1,
      tags: home.chosenTags,
      sort: home.sort == undefined ? 'date_desc' : home.sort,
      category: CATEGORY,
    };

    $.ajax({
      type: 'post',
      url: AJAX_URL,
      data: dataObject,
      dataType: 'json',
      success: function(response) {
        $('#load-more-map').addClass('d-none');

        home.map = {
          posts: Array(),
          page: 1,
          limit: 10,
          max: 0,
          count: 0,
          mapFeatures: Array(),
        };

        var filtered = response.data.posts.filter(function(entry) {
          if (entry.fields.location) {
            if (
              entry.fields.location.value.latitude != '' &&
              entry.fields.location.value.longitude != ''
            ) {
              return true;
            }
          }
        });

        home.map.posts = filtered;
        home.map.max = filtered.length;

        if (home.mapBox.getSource('places')) {
          home.mapBox.removeLayer('places');
          home.mapBox.removeSource('places');
        }

        // $(home.locationsSimpleBar.getContentElement()).find('p').remove();
        // $(home.locationsSimpleBar.getContentElement()).find('.post').addClass('fadeOutDown').remove();

        if (home.map.posts.length > 0) {
          home.map.posts.forEach((entry, index) => {
            //console.log(entry)
            var source = document.getElementById('map-popup-template')
              .innerHTML;
            var template = Handlebars.compile(source);
            var popupHtml = template({
              post: entry,
            });

            home.map.mapFeatures.push({
              type: 'Feature',
              properties: {
                description: popupHtml,
                icon: 'pin',
              },
              geometry: {
                type: 'Point',
                coordinates: [
                  entry.fields.location.value.longitude,
                  entry.fields.location.value.latitude,
                ],
              },
            });

            var source = document.getElementById('map-post-template').innerHTML;
            var template = Handlebars.compile(source);
            var html = template({
              post: entry,
            });

            //$('#map-list .results').append(html);
            //$(home.locationsSimpleBar.getContentElement()).append(html);
            //$(html).insertBefore('#load-more-map');
          });

          home.mapBox.addLayer({
            id: 'places',
            type: 'symbol',
            source: {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: home.map.mapFeatures,
              },
              cluster: true,
              clusterMaxZoom: 14, // Max zoom to cluster points on
              clusterRadius: 50,
            },
            layout: {
              'icon-image': 'pin',
              'icon-size': 0.5,
              'icon-allow-overlap': false,
            },
          });

          // $('#map-list .results').removeClass('loading');

          // $('#map-list .post').each(function (index, element) {
          //     // element == this
          //     if ($(element).hasClass('fadeOutDown')) {
          //         $(element).removeClass('fadeOutDown d-none');
          //     }
          // });

          if (home.map.posts < home.map.max) {
            $('#load-more-map').removeClass('d-none');
          }

          home.lazyLoadImages();
        } else {
          $('#load-more-map').before('<p>There are no locations.</p>');
          $('#map-list .results').removeClass('loading');
        }
      },
    });
  },
  loadMoreMap: () => {
    $('#load-more-map').click(function(e) {
      e.preventDefault();
      if (home.map.page < home.map.max) {
        home.map.page += 1;

        if (home.mapBox.getSource('places')) {
          home.mapBox.removeLayer('places');
          home.mapBox.removeSource('places');
        }

        //$('#map-list .results').empty();
        home.map.posts[home.map.page - 1].forEach((entry, index) => {
          //console.log(entry)
          var source = document.getElementById('map-popup-template').innerHTML;
          var template = Handlebars.compile(source);
          var popupHtml = template({
            post: entry,
          });

          home.map.mapFeatures.push({
            type: 'Feature',
            properties: {
              description: popupHtml,
              icon: 'pin',
            },
            geometry: {
              type: 'Point',
              coordinates: [
                entry.fields.location.value.longitude,
                entry.fields.location.value.latitude,
              ],
            },
          });

          var source = document.getElementById('map-post-template').innerHTML;
          var template = Handlebars.compile(source);
          var html = template({
            post: entry,
          });

          //$('#map-list .results').append(html);
          // $(home.locationsSimpleBar.getContentElement()).append(html);
        //   $(home.locationsSimpleBar.getContentElement())
        //     .find('#load-more-map')
        //     .before(html);
        });

        home.mapBox.addLayer({
          id: 'places',
          type: 'symbol',
          source: {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: home.map.mapFeatures,
            },
            cluster: true,
            clusterMaxZoom: 14, // Max zoom to cluster points on
            clusterRadius: 50,
          },
          layout: {
            'icon-image': 'pin',
            'icon-size': 0.5,
            'icon-allow-overlap': true,
          },
        });

        $('#map-list .results').removeClass('loading');

        $('#map-list .post').each(function(index, element) {
          // element == this
          if ($(element).hasClass('fadeOutDown')) {
            $(element).removeClass('fadeOutDown d-none');
          }
        });

        home.lazyLoadImages();

        if (home.map.page >= home.map.max) {
          $(this).addClass('d-none');
        }
      }
    });
  },

  eventsView: () => {
    // home.eventsSimpleBar = new SimpleBar($('#events-list')[0], {
    //   forceVisible: true,
    // });
  },

  getMaxEvents: (year, month, day) => {
    home.eventsReset();

    var dataObject = {
      action: 'nona_category_event_max',
      security: AJAX_NONCE,
      tags: home.chosenTags,
      date: year + '-' + month + '-' + day,
    };

    if (CATEGORY) {
      dataObject.category = CATEGORY;
    }

    $.ajax({
      type: 'post',
      url: AJAX_URL,
      data: dataObject,
      dataType: 'json',
      success: function(response) {
        home.events.max = response.data.max;

        if (home.events.max > 0) {
          home.eventsUpcoming.active = false;
          home.loadEventPosts(year, month, day);
        } else {
          home.eventsUpcoming.active = true;
          $('#load-more-events')
            .before(
              '<p>There are no events for this date. Any upcoming events will show below.</p>',
            );
          home.getMaxUpcomingEvents(year, month, day);
        }
      },
    });
  },

  loadEventPosts: (year, month, day) => {
    if (home.events.count < home.events.max) {
      $('#events-list').addClass('loading');

      var dataObject = {
        action: 'nona_category_event_results',
        security: AJAX_NONCE,
        limit: home.events.limit,
        page: home.events.page,
        tags: home.chosenTags,
        date: year + '-' + month + '-' + day,
      };

      if (CATEGORY) {
        dataObject.category = CATEGORY;
      }

      $.ajax({
        type: 'post',
        url: AJAX_URL,
        data: dataObject,
        dataType: 'json',
        success: function(response) {
          home.events.count += response.data.count;

          var sorted;

          if (home.events.count > 0) {
            if (typeof response.data.posts === 'object') {
              sorted = Object.values(response.data.posts).sort(function(a, b) {
                if (
                  moment(a.fields.date_time.value).isBefore(
                    b.fields.date_time.value,
                  )
                ) {
                  return -1;
                } else if (
                  moment(a.fields.date_time.value).isAfter(
                    b.fields.date_time.value,
                  )
                ) {
                  return 1;
                } else if (
                  moment(a.fields.date_time.value).isSame(
                    b.fields.date_time.value,
                  )
                ) {
                  return 0;
                }
              });
            } else {
              sorted = response.data.posts.sort(function(a, b) {
                if (
                  moment(a.fields.date_time.value).isBefore(
                    b.fields.date_time.value,
                  )
                ) {
                  return -1;
                } else if (
                  moment(a.fields.date_time.value).isAfter(
                    b.fields.date_time.value,
                  )
                ) {
                  return 1;
                } else if (
                  moment(a.fields.date_time.value).isSame(
                    b.fields.date_time.value,
                  )
                ) {
                  return 0;
                }
              });
            }

            home.events.posts = home.chunk(sorted, home.events.limit);

            home.events.posts[home.events.page - 1].forEach((entry, index) => {
              var source = document.getElementById('events-template').innerHTML;
              var template = Handlebars.compile(source);
              var eventHtml = template({
                post: entry,
              });
              // $(home.eventsSimpleBar.getContentElement())
              //   .find('#load-more-events')
              //   .before(eventHtml);

              $('#load-more-events').before(eventHtml);
            });

            home.resize();

            $('#events-list .post').removeClass('fadeOutDownBig');

            if (home.events.page == home.events.posts.length) {
              $('#load-more-events').addClass('d-none');
            } else {
              home.events.page += 1;

              setTimeout(() => {
                $('#load-more-events').removeClass('d-none');
              }, 1000);
            }
          }

          home.lazyLoadImages();
        },
      });
    }
  },

  loadMoreEventsButton: () => {
    $('#load-more-events').click(function(e) {
      e.preventDefault();

      if (home.eventsUpcoming.active == false) {
        home.loadMoreEvents();
      } else {
        home.loadMoreUpcomingEvents();
      }
    });
  },

  loadMoreEvents: () => {
    home.events.posts[home.events.page - 1].forEach((entry, index) => {
      var source = document.getElementById('events-template').innerHTML;
      var template = Handlebars.compile(source);
      var eventHtml = template({
        post: entry,
      });
      // $(home.eventsSimpleBar.getContentElement())
      //   .find('#load-more-events')
      //   .before(eventHtml);
    });

    home.resize();

    $('#events-list .post').removeClass('fadeOutDownBig');

    if (home.events.page == home.events.posts.length) {
      $('#load-more-events').addClass('d-none');
    } else {
      home.events.page += 1;

      setTimeout(() => {
        $('#load-more-events').removeClass('d-none');
      }, 1000);
    }
  },

  eventsReset: () => {
    // $(home.eventsSimpleBar.getContentElement())
    //   .find('.post, p')
    //   .remove();

    $('#load-more-events').addClass('d-none');

    home.events.posts = Array();
    home.events.page = 1;
    home.events.max = 0;
    home.events.count = 0;
  },

  getMaxUpcomingEvents: (year, month, day) => {
    home.upcomingEventsReset();

    var dataObject = {
      action: 'nona_category_upcoming_event_max',
      security: AJAX_NONCE,
      tags: home.chosenTags,
      date: year + '-' + month + '-' + day,
    };

    if (CATEGORY) {
      dataObject.category = CATEGORY;
    }

    $.ajax({
      type: 'post',
      url: AJAX_URL,
      data: dataObject,
      dataType: 'json',
      success: function(response) {
        home.eventsUpcoming.max = response.data.max;

        if (home.eventsUpcoming.max > 0) {
          home.loadUpcomingEventPosts(year, month, day);
        }
      },
    });
  },

  loadUpcomingEventPosts: (year, month, day) => {
    if (home.eventsUpcoming.count < home.eventsUpcoming.max) {
      $('#events-list').addClass('loading');

      var dataObject = {
        action: 'nona_category_upcoming_event_results',
        security: AJAX_NONCE,
        tags: home.chosenTags,
        date: year + '-' + month + '-' + day,
      };

      if (CATEGORY) {
        dataObject.category = CATEGORY;
      }

      $.ajax({
        type: 'post',
        url: AJAX_URL,
        data: dataObject,
        dataType: 'json',
        success: function(response) {
          home.eventsUpcoming.count += response.data.count;

          if (home.eventsUpcoming.count > 0) {
            var sorted;

            if (typeof response.data.posts === 'object') {
              sorted = Object.values(response.data.posts).sort(function(a, b) {
                if (
                  moment(a.fields.date_time.value).isBefore(
                    b.fields.date_time.value,
                  )
                ) {
                  return -1;
                } else if (
                  moment(a.fields.date_time.value).isAfter(
                    b.fields.date_time.value,
                  )
                ) {
                  return 1;
                } else if (
                  moment(a.fields.date_time.value).isSame(
                    b.fields.date_time.value,
                  )
                ) {
                  return 0;
                }
              });
            } else {
              sorted = response.data.posts.sort(function(a, b) {
                if (
                  moment(a.fields.date_time.value).isBefore(
                    b.fields.date_time.value,
                  )
                ) {
                  return -1;
                } else if (
                  moment(a.fields.date_time.value).isAfter(
                    b.fields.date_time.value,
                  )
                ) {
                  return 1;
                } else if (
                  moment(a.fields.date_time.value).isSame(
                    b.fields.date_time.value,
                  )
                ) {
                  return 0;
                }
              });
            }

            home.eventsUpcoming.posts = home.chunk(
              sorted,
              home.eventsUpcoming.limit,
            );

            home.eventsUpcoming.posts[home.eventsUpcoming.page - 1].forEach(
              (entry, index) => {
                var source = document.getElementById('events-template')
                  .innerHTML;
                var template = Handlebars.compile(source);
                var eventHtml = template({
                  post: entry,
                });
                // $(home.eventsSimpleBar.getContentElement())
                //   .find('#load-more-events')
                //   .before(eventHtml);
              },
            );

            home.resize();

            $('#events-list .post').removeClass('fadeOutDownBig');

            if (home.eventsUpcoming.page == home.eventsUpcoming.posts.length) {
              $('#load-more-events').addClass('d-none');
            } else {
              home.eventsUpcoming.page += 1;

              setTimeout(() => {
                $('#load-more-events').removeClass('d-none');
              }, 1000);
            }
          }

          home.lazyLoadImages();
        },
      });
    }
  },

  loadMoreUpcomingEvents: () => {
    home.eventsUpcoming.posts[home.eventsUpcoming.page - 1].forEach(
      (entry, index) => {
        var source = document.getElementById('events-template').innerHTML;
        var template = Handlebars.compile(source);
        var eventHtml = template({
          post: entry,
        });
        // $(home.eventsSimpleBar.getContentElement())
        //   .find('#load-more-events')
        //   .before(eventHtml);
      },
    );

    home.resize();

    $('#events-list .post').removeClass('fadeOutDownBig');

    if (home.eventsUpcoming.page == home.eventsUpcoming.posts.length) {
      $('#load-more-events').addClass('d-none');
    } else {
      home.eventsUpcoming.page += 1;

      setTimeout(() => {
        $('#load-more-events').removeClass('d-none');
      }, 1000);
    }
  },

  upcomingEventsReset: () => {
    //$('#load-more-events').addClass('d-none');

    home.eventsUpcoming.posts = Array();
    home.eventsUpcoming.page = 1;
    home.eventsUpcoming.max = 0;
    home.eventsUpcoming.count = 0;
  },

  eventsDatePicker: () => {
    var dataObject = {
      action: 'nona_category_event_dates',
      security: AJAX_NONCE,
      limit: -1,
      tags: home.chosenTags,
      category: CATEGORY,
    };

    $.ajax({
      type: 'post',
      url: AJAX_URL,
      data: dataObject,
      dataType: 'json',
      success: function(response) {
        var eventDates = Array();

        response.data.posts.forEach((element) => {
          // if (element.date_time.includes("03-10")) {
          //     console.log(element.ID,element.post_title,element.date_time);
          // }

          eventDates.push(element.date_time);
        });

        $.fn.datepicker.language['en'] = {
          days: [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
          ],
          daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          daysMin: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
          months: [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
          ],
          monthsShort: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ],
          today: 'Today',
          clear: 'Clear',
          dateFormat: 'mm/dd/yyyy',
          timeFormat: 'hh:ii aa',
          firstDay: 0,
          meridiem: '',
        };

        $('.datepicker-here').datepicker({
          prevHtml: '&nbsp;',
          nextHtml: '&nbsp;',
          startDate: null,
          onRenderCell: function(date, cellType) {
            var currentDate = date.getDate();
            // console.log(date);
            //Add extra element, if `eventDates` contains `currentDate`

            var result = undefined;

            eventDates.forEach((element) => {
              if (cellType == 'day' && moment(element).isSame(date, 'day')) {
                result = {
                  html: currentDate + '<span class="dp-note"></span>',
                };
              }
            });

            if (result != undefined) {
              return result;
            }
          },
          onChangeMonth: function(month, year) {},
          onSelect: function onSelect(fd, date) {
            home.datePickerDate = home.datePicker.date;
            home.getMaxEvents(
              moment(date).format('Y'),
              moment(date).format('MM'),
              moment(date).format('DD'),
            );
          },
        });

        home.datePicker = $('.datepicker-here')
          .datepicker()
          .data('datepicker');
        home.datePicker.clear();
      },
    });
  },

  eventsDatePickerUpdate() {
    // var width = $('.datepicker--cell-day').width();
    // $('.datepicker--cell-day').css('height', width);
  },
  getMax: (cat) => {
    var userTags =
      home.cookies.get('lake_nona_tags') != undefined
        ? JSON.parse(home.cookies.get('lake_nona_tags'))
        : {};

    var sortable = [];
    for (var userTag in userTags) {
      sortable[userTag] = userTags[userTag];
    }

    sortable.sort(function(a, b) {
      return a - b;
    });

    var userTagsArray = [];

    for (var sortedItem in sortable) {
      userTagsArray.push(sortedItem);
    }

    var dataObject = {
      action: 'nona_category_max',
      security: AJAX_NONCE,
      tags: home.chosenTags,
      category: CATEGORY,
      user_tags: userTagsArray.slice(0, 3),
    };

    $.ajax({
      type: 'post',
      url: AJAX_URL,
      data: dataObject,
      dataType: 'json',
      success: function(response) {
        home.max = response.data.max;

        home.loadPosts(CATEGORY, userTagsArray.slice(0, 3));
      },
    });
  },

  loadMore: () => {
    $('#load-more').click(function(e) {
      e.preventDefault();
      home.loadMorePosts();
    });
  },

  loadMorePosts: () => {
    home.posts[home.page].forEach((entry, index) => {
      switch (home.pattern[index]) {
        case 'big-left':
          var source = document.getElementById('big-post-left-template')
            .innerHTML;
          var template = Handlebars.compile(source);
          var html = template({
            post: entry,
          });

          $('#list .results').append(html);
          break;

        case 'big-right':
          var source = document.getElementById('big-post-right-template')
            .innerHTML;
          var template = Handlebars.compile(source);
          var html = template({
            post: entry,
          });

          $('#list .results').append(html);
          break;

        case 'left-right':
          let row = $('<div class="row"></div>');
          for (let i = 0; i < entry.length; i += 1) {
            var source = document.getElementById('sides-post-template')
              .innerHTML;
            var template = Handlebars.compile(source);
            var html = template({
              post: entry[i],
              size: i == 0 ? 7 : 5,
            });

            row.append(html);
          }
          $('#list .results').append(row);
          break;

        case 'slider':
          var source = document.getElementById('posts-slider-template')
            .innerHTML;
          var template = Handlebars.compile(source);
          var html = template({
            slide: entry,
          });
          //console.log(entry);
          $('#list .results').append(html);

          $('.posts-slider').each(function(index, element) {
            if (!$(element).hasClass('slick-slider')) {
              $(element).slick({
                infinite: false,
                speed: 600,
                autoplay: false,
                variableWidth: false,
                dots: false,
                adaptiveHeight: false,
                slidesToShow: 4,
                slidesToScroll: 4,
                responsive: [
                  {
                    breakpoint: 991,
                    settings: {
                      slidesToShow: 1,
                      slidesToScroll: 1,
                      infinite: false,
                      dots: true,
                      arrows: false,
                      variableWidth: true,
                    },
                  },
                ],
              });
            }
          });

          break;

        case 'big-center':
          var source = document.getElementById('big-post-center-template')
            .innerHTML;
          var template = Handlebars.compile(source);
          var html = template({
            post: entry,
          });

          $('#list .results').append(html);
          break;

        case 'big-last':
          var source = document.getElementById('big-post-last-template')
            .innerHTML;
          var template = Handlebars.compile(source);
          var html = template({
            post: entry,
          });

          $('#list .results').append(html);
          break;

        default:
          break;
      }
    });

    $('#list .results').removeClass('loading');

    $('#list .post').each(function(index, element) {
      // element == this
      if (!$(element).hasClass('fadeInUp')) {
        setTimeout(() => {
          $(element).addClass('fadeInUp');
        }, 100 * index);
      }
    });

    if (home.page >= home.pageMax) {
      $('#load-more').addClass('d-none');
    } else {
      $('#load-more').removeClass('d-none');
    }

    home.page += 1;

    // home.lazyLoadImages();
    home.parallax.reInit();
  },
  resize: () => {
    home.eventsDatePickerUpdate();

    var nav_item = $('nav .category-bar ul li.active');
    var activeBar = $('nav .category-bar ul .active-bar');

    home.active_bar.left = $(nav_item).position().left;
    home.active_bar.width = $(nav_item).outerWidth(true);

    $(activeBar).css({
      left: $(nav_item).position() .left
      // width: $(nav_item).outerwidth(true),
    });

    // Mobile Category Bar
    var nav_item = $('header .category-bar ul li.active');
    var activeBar = $('header .category-bar ul .active-bar');

    home.active_bar.left = $(nav_item).position().left;
    // home.active_bar.width = $(nav_item).outerWidth(true);

    $(activeBar).css({
      left: $(nav_item).position() .left
      // width: $(nav_item).outerwidth(true),
    });

    if (window.innerWidth <= 991) {
      let eventsHeight =
        $('#events-list .post').innerHeight() * $('#events-list .post').length;
      $('#events-list').css({
        height: `${eventsHeight}px`,
      });
    } else {
      $('#events-list').css({
        height: 'calc(100vh - 229px)',
      });
    }
  },
  getUrlVars: () => {
    var vars = {};
    var parts = window.location.href.replace(
      /[?&]+([^=&]+)=([^&]*)/gi,
      function(m, key, value) {
        vars[key] = value;
      },
    );
    return vars;
  },
  lazyLoadImages: () => {},
  showFilterBar: () => {
    $('.filter-bar').addClass('show');
  },
  showFeaturedPosts: () => {
    $('.featured-posts').addClass('show');
  },
  chunk: (array, size) => {
    const chunked_arr = [];
    for (let i = 0; i < array.length; i++) {
      const last = chunked_arr[chunked_arr.length - 1];
      if (!last || last.length === size) {
        chunked_arr.push([array[i]]);
      } else {
        last.push(array[i]);
      }
    }
    return chunked_arr;
  },

  scroll: () => {
    //home.parallax.reInit();
    home.parallax.scrollPosition(home.parallax);
  },
};



home.loadMore();


(function ($) {

  'use strict';

  home.handleBarsHelpers();
  home.getTopTags();
  home.showFeaturedPosts();
  home.categorySlider();
  home.featuredSlider();
  home.eventsDatePicker();
  home.getCategories();
  home.mapView();
  home.eventsView();
  home.categoryBar();
  home.mobileCategoryBar();
  home.filterBar();
  home.setCategory(CATEGORY ? CATEGORY : 'discover');

  // home.lastPostItem();

  home.loadMoreMap();
  home.loadMoreEventsButton();

  $(window).resize(function() {
    home.resize();
  });

  home.resize();

  window.onload = function() {
    // home.lazyLoadImages();
    // home.showHeader();
    home.showFilterBar();
  };

  home.parallax = new jamParallax({
    selector: '.parallax',
    classToAdd: 'jam-init',
  });

  home.scroll();

  window.onscroll = function() {
    home.scroll();
  };
})(jQuery);
