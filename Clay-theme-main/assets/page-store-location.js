var map;

var BlsCreateMapStoreLocation = (function () {
    return {
        init: function () {
            const mapEl = document.getElementById('map');
            const token = mapEl ? mapEl.getAttribute('data-access-token') : '';
            mapboxgl.accessToken = token || 'YOUR_MAPBOX_PUBLIC_TOKEN';
            map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [-77.04, 38.907],
                zoom: 12,
                pitch: 60,
                bearing: 0
            });
            const stores = document.querySelectorAll('.store-infor__items')
            const storeArray = Array.from(stores).map((element) => {
                return {
                    type: 'Feature',
                    geometry: {
                        type: "Point",
                        coordinates: [Number(element.dataset?.lng), Number(element.dataset?.lat)]
                    },
                    properties: {
                        phone: element.dataset.phone,
                        address: element.dataset.address,
                        name: element.dataset.name
                    }
                }
            })
            const listStore = {
                type: 'FeatureCollection',
                features: storeArray
            }
            listStore.features.forEach((store, index) => {
                store.properties.id = `store_${index}`;
            })
            map.on('load', () => {
                map.addSource('places', {
                    type: 'geojson',
                    data: listStore
                });
            });
            map.addControl(
                new MapboxGeocoder({
                    accessToken: mapboxgl.accessToken,
                    mapboxgl: mapboxgl
                }),
                'top-left'
            );
            this.addMarker(listStore)
            this.storeInforAction(listStore)
        },
        addMarker: function (listStore) {
            listStore.features.forEach(store => {
                const marker = document.createElement('div');
                marker.id = `marker-${store.properties.id}`;
                marker.addEventListener('click', e => {
                    this.createPopupMarker(store);
                    this.zoomMarker(store)
                })
                marker.classList.add('marker');
                new mapboxgl.Marker(marker, { offset: [0, -23] })
                    .setLngLat(store.geometry.coordinates)
                    .addTo(map);
            })
        },
        createPopupMarker: function (listStore) {
            const closePopup = document.getElementsByClassName('mapboxgl-popup');
            if (closePopup[0]) closePopup[0].remove();

            const { address, phone, name } = listStore.properties;
            const popup = new mapboxgl.Popup({ closeOnClick: false })
                .setLngLat(listStore.geometry.coordinates)
                .setHTML(`<h3>${name}</h3><div>${address}<br>${phone}</div>`)
                .addTo(map)
            let closeButton = document.querySelector(".bls__location-page .mapboxgl-popup-close-button")
            if(closeButton)
                 closeButton.innerHTML = `<svg width="13" height="13" viewBox="0 0 13 13" fill="white" class="transition">
            <use href="#icon-close" />
          </svg>`
        },
        zoomMarker: function (listStore) {
            map.flyTo({
                center: listStore.geometry.coordinates,
                zoom: 15,
            })
        },
        storeInforAction: function (listStore) {
            const listStoresInfor = document.querySelectorAll('.store-infor__items a');
            listStoresInfor.forEach(items => {
                items.addEventListener("click", e => {
                    e.preventDefault();
                    const target = e.currentTarget;
                    if (!target.closest('.store-infor__items').classList.contains('store-active')) {
                        document.querySelectorAll('.store-infor__items').forEach(item => {
                            item.classList.remove('store-active')
                        })
                        target.closest('.store-infor__items').classList.add('store-active')
                    }else{
                        target.closest('.store-infor__items').classList.remove('store-active')
                        
                    }
                    const currentFeature = listStore.features.find(feature => target.id === `infor-${feature.properties.id}`);
                    this.createPopupMarker(currentFeature);
                    this.zoomMarker(currentFeature)
                })
            })
        }
    }
})();
BlsCreateMapStoreLocation.init();