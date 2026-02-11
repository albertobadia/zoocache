window.BENCHMARK_DATA = {
  "lastUpdate": 1770850826866,
  "repoUrl": "https://github.com/albertobadia/zoocache",
  "entries": {
    "Python Benchmark": [
      {
        "commit": {
          "author": {
            "name": "albertobadia",
            "username": "albertobadia"
          },
          "committer": {
            "name": "albertobadia",
            "username": "albertobadia"
          },
          "id": "87301082a129a15639610e65b0681a6c71273e3a",
          "message": "NEXT RELEASE",
          "timestamp": "2026-02-10T04:19:28Z",
          "url": "https://github.com/albertobadia/zoocache/pull/4/commits/87301082a129a15639610e65b0681a6c71273e3a"
        },
        "date": 1770843381315,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 451483.241846587,
            "unit": "iter/sec",
            "range": "stddev: 4.378727566744655e-7",
            "extra": "mean: 2.2149216345438525 usec\nrounds: 16053"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.78708996159609,
            "unit": "iter/sec",
            "range": "stddev: 0.00017406663214195546",
            "extra": "mean: 102.17541719999872 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 114125.80773987433,
            "unit": "iter/sec",
            "range": "stddev: 0.000005818869249759834",
            "extra": "mean: 8.762259998889022 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 166.64832042252442,
            "unit": "iter/sec",
            "range": "stddev: 0.00005816606647238746",
            "extra": "mean: 6.000660537499414 msec\nrounds: 160"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 180.02178028445144,
            "unit": "iter/sec",
            "range": "stddev: 0.0000550859375731632",
            "extra": "mean: 5.554883405885141 msec\nrounds: 170"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 180.00156765937015,
            "unit": "iter/sec",
            "range": "stddev: 0.000045903587192507546",
            "extra": "mean: 5.555507171428482 msec\nrounds: 175"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1361.7379324480828,
            "unit": "iter/sec",
            "range": "stddev: 0.000013752740612005324",
            "extra": "mean: 734.3556907475115 usec\nrounds: 1232"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 157.32858331097637,
            "unit": "iter/sec",
            "range": "stddev: 0.00009883663607443612",
            "extra": "mean: 6.356124099988847 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6314.959303687899,
            "unit": "iter/sec",
            "range": "stddev: 0.000009771657260888805",
            "extra": "mean: 158.3541479698857 usec\nrounds: 4778"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5155.9981819791265,
            "unit": "iter/sec",
            "range": "stddev: 0.000016129322272953655",
            "extra": "mean: 193.94886590440004 usec\nrounds: 4109"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 174.8719085128879,
            "unit": "iter/sec",
            "range": "stddev: 0.0003032402108347787",
            "extra": "mean: 5.718471357143683 msec\nrounds: 56"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 109.46938607837437,
            "unit": "iter/sec",
            "range": "stddev: 0.00044315433352525664",
            "extra": "mean: 9.134974039993722 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 474962.35728935944,
            "unit": "iter/sec",
            "range": "stddev: 4.1517145247311857e-7",
            "extra": "mean: 2.105430008615975 usec\nrounds: 129116"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 454497.25221796625,
            "unit": "iter/sec",
            "range": "stddev: 0.0000010079545358242754",
            "extra": "mean: 2.200233324007916 usec\nrounds: 175717"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 464511.0045946292,
            "unit": "iter/sec",
            "range": "stddev: 4.1711690671963794e-7",
            "extra": "mean: 2.1528015270008143 usec\nrounds: 151930"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 452578.5787891237,
            "unit": "iter/sec",
            "range": "stddev: 8.827260185697122e-7",
            "extra": "mean: 2.209561050537357 usec\nrounds: 155232"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 460182.5863311038,
            "unit": "iter/sec",
            "range": "stddev: 4.1921363230488755e-7",
            "extra": "mean: 2.1730505014818067 usec\nrounds: 141184"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 467228.8877825331,
            "unit": "iter/sec",
            "range": "stddev: 4.969900335212959e-7",
            "extra": "mean: 2.140278621782136 usec\nrounds: 124922"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 57.451096391521965,
            "unit": "iter/sec",
            "range": "stddev: 0.002454995650144388",
            "extra": "mean: 17.406108200009385 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 54.07057451432827,
            "unit": "iter/sec",
            "range": "stddev: 0.0002722099005323399",
            "extra": "mean: 18.494347600005767 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 36.505925576139035,
            "unit": "iter/sec",
            "range": "stddev: 0.009421896683516054",
            "extra": "mean: 27.39281319999236 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 475392.4791152373,
            "unit": "iter/sec",
            "range": "stddev: 4.2281607825686357e-7",
            "extra": "mean: 2.1035250743998315 usec\nrounds: 182816"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 972081.8097397372,
            "unit": "iter/sec",
            "range": "stddev: 3.709410077586068e-7",
            "extra": "mean: 1.0287200007041974 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 195297.62379205928,
            "unit": "iter/sec",
            "range": "stddev: 0.000001941016290583699",
            "extra": "mean: 5.120390000570296 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4749.047755424509,
            "unit": "iter/sec",
            "range": "stddev: 0.00000606762900588709",
            "extra": "mean: 210.56852899779102 usec\nrounds: 4690"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4697.397604350984,
            "unit": "iter/sec",
            "range": "stddev: 0.000006348885741362572",
            "extra": "mean: 212.88383148016808 usec\nrounds: 4587"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 2964.719478380817,
            "unit": "iter/sec",
            "range": "stddev: 0.0000063563613772861495",
            "extra": "mean: 337.3000404564922 usec\nrounds: 2892"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2860.374042351406,
            "unit": "iter/sec",
            "range": "stddev: 0.000007244664562465328",
            "extra": "mean: 349.60462694520106 usec\nrounds: 2828"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "albertobadia",
            "username": "albertobadia"
          },
          "committer": {
            "name": "albertobadia",
            "username": "albertobadia"
          },
          "id": "8a6cbab7cd0c13a65d6088baa10d99193942d330",
          "message": "NEXT RELEASE",
          "timestamp": "2026-02-10T04:19:28Z",
          "url": "https://github.com/albertobadia/zoocache/pull/4/commits/8a6cbab7cd0c13a65d6088baa10d99193942d330"
        },
        "date": 1770844933062,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 457398.6737991657,
            "unit": "iter/sec",
            "range": "stddev: 3.545355002530979e-7",
            "extra": "mean: 2.1862765619628344 usec\nrounds: 11285"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.784120446483152,
            "unit": "iter/sec",
            "range": "stddev: 0.00009612814963166327",
            "extra": "mean: 102.20642780000162 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 83692.23352976394,
            "unit": "iter/sec",
            "range": "stddev: 0.000009142489090782541",
            "extra": "mean: 11.948539999764307 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 166.62987778043356,
            "unit": "iter/sec",
            "range": "stddev: 0.00007189615362133956",
            "extra": "mean: 6.0013246923081205 msec\nrounds: 156"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 180.1122120868162,
            "unit": "iter/sec",
            "range": "stddev: 0.000049154917323374613",
            "extra": "mean: 5.5520943772429385 msec\nrounds: 167"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 179.802620040246,
            "unit": "iter/sec",
            "range": "stddev: 0.000050597343659442514",
            "extra": "mean: 5.561654217141918 msec\nrounds: 175"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1319.7976924151246,
            "unit": "iter/sec",
            "range": "stddev: 0.000014651001158989982",
            "extra": "mean: 757.6918839508498 usec\nrounds: 1215"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 157.14050789241927,
            "unit": "iter/sec",
            "range": "stddev: 0.00008354444048690768",
            "extra": "mean: 6.363731499993719 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6322.428213336334,
            "unit": "iter/sec",
            "range": "stddev: 0.000009199119902720615",
            "extra": "mean: 158.16707857443618 usec\nrounds: 4518"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5175.866254912284,
            "unit": "iter/sec",
            "range": "stddev: 0.000010173966965742907",
            "extra": "mean: 193.20437406026969 usec\nrounds: 4256"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 172.14706147983765,
            "unit": "iter/sec",
            "range": "stddev: 0.0003350670107444474",
            "extra": "mean: 5.808986754717988 msec\nrounds: 53"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 109.71187631609217,
            "unit": "iter/sec",
            "range": "stddev: 0.000464102884623707",
            "extra": "mean: 9.114783500000385 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 478714.9383357475,
            "unit": "iter/sec",
            "range": "stddev: 4.103341818290706e-7",
            "extra": "mean: 2.088925830216412 usec\nrounds: 129635"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 469939.0351640511,
            "unit": "iter/sec",
            "range": "stddev: 3.906802674625973e-7",
            "extra": "mean: 2.127935594137035 usec\nrounds: 169177"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 458466.25846841885,
            "unit": "iter/sec",
            "range": "stddev: 8.371490819923804e-7",
            "extra": "mean: 2.1811855976940655 usec\nrounds: 180832"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 466517.72692377615,
            "unit": "iter/sec",
            "range": "stddev: 4.0835140573703157e-7",
            "extra": "mean: 2.143541268182911 usec\nrounds: 156937"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 464804.9078331097,
            "unit": "iter/sec",
            "range": "stddev: 4.372011838094616e-7",
            "extra": "mean: 2.1514402777327266 usec\nrounds: 151677"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 451716.80839937326,
            "unit": "iter/sec",
            "range": "stddev: 4.789082738926405e-7",
            "extra": "mean: 2.2137763780440882 usec\nrounds: 150106"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 55.59802936120657,
            "unit": "iter/sec",
            "range": "stddev: 0.0027776664228053192",
            "extra": "mean: 17.986249000000498 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 53.530892876336935,
            "unit": "iter/sec",
            "range": "stddev: 0.00028174364356545824",
            "extra": "mean: 18.6808018000022 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 36.40785800993511,
            "unit": "iter/sec",
            "range": "stddev: 0.009171193125258298",
            "extra": "mean: 27.466598000000886 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 476815.7520692223,
            "unit": "iter/sec",
            "range": "stddev: 4.2074046907489127e-7",
            "extra": "mean: 2.097246149399074 usec\nrounds: 184843"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 1083235.8410245397,
            "unit": "iter/sec",
            "range": "stddev: 3.6583367549849475e-7",
            "extra": "mean: 923.1600009229624 nsec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 183597.7445823342,
            "unit": "iter/sec",
            "range": "stddev: 0.0000013883311892281831",
            "extra": "mean: 5.446690003054755 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4835.621057392371,
            "unit": "iter/sec",
            "range": "stddev: 0.000011639125444978832",
            "extra": "mean: 206.79866931906656 usec\nrounds: 4022"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4715.5735568875,
            "unit": "iter/sec",
            "range": "stddev: 0.000008837340998335494",
            "extra": "mean: 212.0632809426574 usec\nrounds: 4371"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 3099.2108635672726,
            "unit": "iter/sec",
            "range": "stddev: 0.000007803520674868746",
            "extra": "mean: 322.6627822441787 usec\nrounds: 2861"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2925.5589361244297,
            "unit": "iter/sec",
            "range": "stddev: 0.000025921943422011697",
            "extra": "mean: 341.8150246956666 usec\nrounds: 2713"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "albertobadia",
            "username": "albertobadia"
          },
          "committer": {
            "name": "albertobadia",
            "username": "albertobadia"
          },
          "id": "7bda1fbb47b404f9472649cf613c562767307d6e",
          "message": "NEXT RELEASE",
          "timestamp": "2026-02-10T04:19:28Z",
          "url": "https://github.com/albertobadia/zoocache/pull/4/commits/7bda1fbb47b404f9472649cf613c562767307d6e"
        },
        "date": 1770845285410,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 441340.1268331326,
            "unit": "iter/sec",
            "range": "stddev: 4.559860114682398e-7",
            "extra": "mean: 2.2658261490419442 usec\nrounds: 16215"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.788361662648459,
            "unit": "iter/sec",
            "range": "stddev: 0.000148604016976593",
            "extra": "mean: 102.1621426000138 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 88986.81395932079,
            "unit": "iter/sec",
            "range": "stddev: 0.000008144286105179704",
            "extra": "mean: 11.237619996791182 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 166.42370159279372,
            "unit": "iter/sec",
            "range": "stddev: 0.000053316439635693575",
            "extra": "mean: 6.008759512192588 msec\nrounds: 164"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 179.7358717717551,
            "unit": "iter/sec",
            "range": "stddev: 0.00003524221753586383",
            "extra": "mean: 5.563719641173748 msec\nrounds: 170"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 179.15452334486784,
            "unit": "iter/sec",
            "range": "stddev: 0.000032360023797624355",
            "extra": "mean: 5.581773662923519 msec\nrounds: 178"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1357.8924406555195,
            "unit": "iter/sec",
            "range": "stddev: 0.000037131430146965235",
            "extra": "mean: 736.43535383204 usec\nrounds: 1122"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 156.7408683163007,
            "unit": "iter/sec",
            "range": "stddev: 0.00011387901525402261",
            "extra": "mean: 6.379956999995784 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6354.6710034618,
            "unit": "iter/sec",
            "range": "stddev: 0.000010731433010725676",
            "extra": "mean: 157.36455899215483 usec\nrounds: 4882"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5188.528485900026,
            "unit": "iter/sec",
            "range": "stddev: 0.000015442653433947324",
            "extra": "mean: 192.73287266660066 usec\nrounds: 3589"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 175.68956219049522,
            "unit": "iter/sec",
            "range": "stddev: 0.0002058455521376952",
            "extra": "mean: 5.691857771924596 msec\nrounds: 57"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 119.74439084520695,
            "unit": "iter/sec",
            "range": "stddev: 0.0002546715734366948",
            "extra": "mean: 8.35112186000174 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 465734.4707923368,
            "unit": "iter/sec",
            "range": "stddev: 4.3631207025116005e-7",
            "extra": "mean: 2.1471462017804632 usec\nrounds: 134157"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 454962.3846101955,
            "unit": "iter/sec",
            "range": "stddev: 4.4285807138627156e-7",
            "extra": "mean: 2.197983907739502 usec\nrounds: 178222"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 458057.7154930906,
            "unit": "iter/sec",
            "range": "stddev: 4.3010637288638006e-7",
            "extra": "mean: 2.1831310033136733 usec\nrounds: 149210"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 459237.29861715017,
            "unit": "iter/sec",
            "range": "stddev: 4.1740926464340454e-7",
            "extra": "mean: 2.1775234786268185 usec\nrounds: 124922"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 459592.0020277971,
            "unit": "iter/sec",
            "range": "stddev: 4.946217102874069e-7",
            "extra": "mean: 2.175842911947623 usec\nrounds: 153328"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 460391.07583221776,
            "unit": "iter/sec",
            "range": "stddev: 4.394019841590888e-7",
            "extra": "mean: 2.1720664289427583 usec\nrounds: 148324"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 55.26481106889499,
            "unit": "iter/sec",
            "range": "stddev: 0.002577517148860566",
            "extra": "mean: 18.094696799983012 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 53.47653064798973,
            "unit": "iter/sec",
            "range": "stddev: 0.0007357076417597139",
            "extra": "mean: 18.69979200001808 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 34.862142642217734,
            "unit": "iter/sec",
            "range": "stddev: 0.009576448317312119",
            "extra": "mean: 28.684410199991817 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 466022.1492057835,
            "unit": "iter/sec",
            "range": "stddev: 4.253446495091794e-7",
            "extra": "mean: 2.145820754880956 usec\nrounds: 182482"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 1033282.0162044431,
            "unit": "iter/sec",
            "range": "stddev: 3.0993463671505357e-7",
            "extra": "mean: 967.7899976168193 nsec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 203712.45581730895,
            "unit": "iter/sec",
            "range": "stddev: 5.731425526148845e-7",
            "extra": "mean: 4.90887999944789 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4746.315889431475,
            "unit": "iter/sec",
            "range": "stddev: 0.00000578271050791391",
            "extra": "mean: 210.68972721067297 usec\nrounds: 4410"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4664.898274774593,
            "unit": "iter/sec",
            "range": "stddev: 0.000005308194681647643",
            "extra": "mean: 214.36694673654372 usec\nrounds: 4412"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 3012.980481429672,
            "unit": "iter/sec",
            "range": "stddev: 0.000007694772973211022",
            "extra": "mean: 331.8972712114935 usec\nrounds: 2699"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2885.555505524969,
            "unit": "iter/sec",
            "range": "stddev: 0.000009389077879395444",
            "extra": "mean: 346.5537218346004 usec\nrounds: 2725"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "68045838+albertobadia@users.noreply.github.com",
            "name": "Alberto Daniel Badia",
            "username": "albertobadia"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "6afff8a71bca89d0df37e3ff28ae936eee178b89",
          "message": "Merge pull request #4 from albertobadia/dev\n\nNEXT RELEASE",
          "timestamp": "2026-02-11T18:32:57-03:00",
          "tree_id": "421f484775976ca4a1b94073bd8f95d49da2d3c6",
          "url": "https://github.com/albertobadia/zoocache/commit/6afff8a71bca89d0df37e3ff28ae936eee178b89"
        },
        "date": 1770845726439,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 444911.92571252695,
            "unit": "iter/sec",
            "range": "stddev: 4.080350246839999e-7",
            "extra": "mean: 2.2476358627575532 usec\nrounds: 13256"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.77709307187277,
            "unit": "iter/sec",
            "range": "stddev: 0.00010186334026679488",
            "extra": "mean: 102.27988959999266 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 93476.81399038792,
            "unit": "iter/sec",
            "range": "stddev: 0.000008584053352184766",
            "extra": "mean: 10.697840002364956 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 166.40840713807577,
            "unit": "iter/sec",
            "range": "stddev: 0.00006512634653663425",
            "extra": "mean: 6.009311772152591 msec\nrounds: 158"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 179.21742631875748,
            "unit": "iter/sec",
            "range": "stddev: 0.00006304171897691238",
            "extra": "mean: 5.57981453333334 msec\nrounds: 165"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 179.91683592418846,
            "unit": "iter/sec",
            "range": "stddev: 0.00004075876048298231",
            "extra": "mean: 5.558123534483286 msec\nrounds: 174"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1364.2810502621805,
            "unit": "iter/sec",
            "range": "stddev: 0.00001566452693195858",
            "extra": "mean: 732.9867990234309 usec\nrounds: 1229"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 157.11666287726368,
            "unit": "iter/sec",
            "range": "stddev: 0.00011176720149554382",
            "extra": "mean: 6.364697300000444 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6409.05326220196,
            "unit": "iter/sec",
            "range": "stddev: 0.000011418097936179513",
            "extra": "mean: 156.0292853076446 usec\nrounds: 4921"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5223.5085898780835,
            "unit": "iter/sec",
            "range": "stddev: 0.000010297009015635821",
            "extra": "mean: 191.44220456299473 usec\nrounds: 3945"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 173.8677850753482,
            "unit": "iter/sec",
            "range": "stddev: 0.00033193846497191405",
            "extra": "mean: 5.751496745453075 msec\nrounds: 55"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 108.41943504329024,
            "unit": "iter/sec",
            "range": "stddev: 0.000592801906374892",
            "extra": "mean: 9.223438579999197 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 473436.18367440696,
            "unit": "iter/sec",
            "range": "stddev: 4.2240060245289675e-7",
            "extra": "mean: 2.112217093841148 usec\nrounds: 102481"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 461761.4026899037,
            "unit": "iter/sec",
            "range": "stddev: 4.261331439909335e-7",
            "extra": "mean: 2.1656205871142307 usec\nrounds: 171204"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 452066.03451074637,
            "unit": "iter/sec",
            "range": "stddev: 8.32284485165731e-7",
            "extra": "mean: 2.2120662108186506 usec\nrounds: 168039"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 459666.1085503422,
            "unit": "iter/sec",
            "range": "stddev: 4.2284162644357317e-7",
            "extra": "mean: 2.1754921265649085 usec\nrounds: 156667"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 459306.5544030191,
            "unit": "iter/sec",
            "range": "stddev: 4.4094047062704625e-7",
            "extra": "mean: 2.177195144318687 usec\nrounds: 149187"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 450458.78641431924,
            "unit": "iter/sec",
            "range": "stddev: 4.962855031310755e-7",
            "extra": "mean: 2.21995891779593 usec\nrounds: 136166"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 55.65313900621292,
            "unit": "iter/sec",
            "range": "stddev: 0.002601743206256668",
            "extra": "mean: 17.96843840000406 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 53.12630508088943,
            "unit": "iter/sec",
            "range": "stddev: 0.0006995658224158646",
            "extra": "mean: 18.823066999999583 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 38.10153087151429,
            "unit": "iter/sec",
            "range": "stddev: 0.008133092395785822",
            "extra": "mean: 26.24566459999187 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 467558.2065407648,
            "unit": "iter/sec",
            "range": "stddev: 4.222197286118852e-7",
            "extra": "mean: 2.1387711433802274 usec\nrounds: 175717"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 1036409.0513694128,
            "unit": "iter/sec",
            "range": "stddev: 4.0067036204349577e-7",
            "extra": "mean: 964.8699986541941 nsec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 207986.2562642824,
            "unit": "iter/sec",
            "range": "stddev: 0.0000013463780332888158",
            "extra": "mean: 4.808010000090235 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4604.767915450388,
            "unit": "iter/sec",
            "range": "stddev: 0.000009093717251851287",
            "extra": "mean: 217.16621084087603 usec\nrounds: 4520"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4547.3448740771455,
            "unit": "iter/sec",
            "range": "stddev: 0.000004604136664531089",
            "extra": "mean: 219.90854612779808 usec\nrounds: 4455"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 3005.196153782874,
            "unit": "iter/sec",
            "range": "stddev: 0.000007328828588071407",
            "extra": "mean: 332.7569811844802 usec\nrounds: 2870"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2872.2424497559596,
            "unit": "iter/sec",
            "range": "stddev: 0.00003283090756887504",
            "extra": "mean: 348.1600239161444 usec\nrounds: 2676"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "albertobadia",
            "username": "albertobadia"
          },
          "committer": {
            "name": "albertobadia",
            "username": "albertobadia"
          },
          "id": "5afdb1bc5f563635f1388f6d70cfba07fd084bd9",
          "message": "NEXT RELEASE",
          "timestamp": "2026-02-11T21:33:02Z",
          "url": "https://github.com/albertobadia/zoocache/pull/5/commits/5afdb1bc5f563635f1388f6d70cfba07fd084bd9"
        },
        "date": 1770848111030,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 450539.4370380095,
            "unit": "iter/sec",
            "range": "stddev: 4.3267298737168113e-7",
            "extra": "mean: 2.219561525122684 usec\nrounds: 12694"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.778567067204564,
            "unit": "iter/sec",
            "range": "stddev: 0.00010837166829963945",
            "extra": "mean: 102.26447220000239 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 106943.63642861563,
            "unit": "iter/sec",
            "range": "stddev: 0.00000578803280967918",
            "extra": "mean: 9.350719999758894 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 167.31489126862036,
            "unit": "iter/sec",
            "range": "stddev: 0.000054796860823922725",
            "extra": "mean: 5.97675432484083 msec\nrounds: 157"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 179.86842387789181,
            "unit": "iter/sec",
            "range": "stddev: 0.00005187116322302434",
            "extra": "mean: 5.559619517647383 msec\nrounds: 170"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 179.65664268836724,
            "unit": "iter/sec",
            "range": "stddev: 0.00005208756231007193",
            "extra": "mean: 5.566173257142525 msec\nrounds: 175"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1341.9027967387633,
            "unit": "iter/sec",
            "range": "stddev: 0.00008527279450562093",
            "extra": "mean: 745.2104596773386 usec\nrounds: 1240"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 158.10236685564848,
            "unit": "iter/sec",
            "range": "stddev: 0.00007904545752515557",
            "extra": "mean: 6.325016000000971 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6366.90541462436,
            "unit": "iter/sec",
            "range": "stddev: 0.000009011696433965812",
            "extra": "mean: 157.0621730461185 usec\nrounds: 4964"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5206.744009167342,
            "unit": "iter/sec",
            "range": "stddev: 0.00001244262325220438",
            "extra": "mean: 192.05860672991284 usec\nrounds: 3893"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 165.26171695640588,
            "unit": "iter/sec",
            "range": "stddev: 0.0003525539914359501",
            "extra": "mean: 6.051008173077303 msec\nrounds: 52"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 101.04262591693983,
            "unit": "iter/sec",
            "range": "stddev: 0.0006079837929597926",
            "extra": "mean: 9.896813260000101 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 473555.8621094723,
            "unit": "iter/sec",
            "range": "stddev: 4.0171120447389094e-7",
            "extra": "mean: 2.111683288103462 usec\nrounds: 95058"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 466745.7024888118,
            "unit": "iter/sec",
            "range": "stddev: 4.0428655999576546e-7",
            "extra": "mean: 2.1424942847202124 usec\nrounds: 47329"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 468392.30175210995,
            "unit": "iter/sec",
            "range": "stddev: 4.1112882972977817e-7",
            "extra": "mean: 2.13496250100463 usec\nrounds: 148324"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 456858.5061258957,
            "unit": "iter/sec",
            "range": "stddev: 8.508791303407773e-7",
            "extra": "mean: 2.1888615109301077 usec\nrounds: 162576"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 472489.92035133304,
            "unit": "iter/sec",
            "range": "stddev: 3.9519738682188707e-7",
            "extra": "mean: 2.1164472657034086 usec\nrounds: 124767"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 469924.5425570735,
            "unit": "iter/sec",
            "range": "stddev: 4.0049715608341567e-7",
            "extra": "mean: 2.128001220277929 usec\nrounds: 98339"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 58.85551149670826,
            "unit": "iter/sec",
            "range": "stddev: 0.002392982417097909",
            "extra": "mean: 16.990762200001086 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 52.26981679429908,
            "unit": "iter/sec",
            "range": "stddev: 0.0005313720540255463",
            "extra": "mean: 19.13149999999746 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 36.43299657512755,
            "unit": "iter/sec",
            "range": "stddev: 0.007910620988886978",
            "extra": "mean: 27.447646200002396 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 476284.2770596881,
            "unit": "iter/sec",
            "range": "stddev: 4.324681612644581e-7",
            "extra": "mean: 2.0995864196345906 usec\nrounds: 191571"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 1070365.8504849577,
            "unit": "iter/sec",
            "range": "stddev: 4.0352611557472816e-7",
            "extra": "mean: 934.2600004913493 nsec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 194286.04738486884,
            "unit": "iter/sec",
            "range": "stddev: 0.000001917967107763974",
            "extra": "mean: 5.147049999010278 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4687.200898490191,
            "unit": "iter/sec",
            "range": "stddev: 0.000012716304532577823",
            "extra": "mean: 213.34694664402227 usec\nrounds: 4723"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4572.136633375093,
            "unit": "iter/sec",
            "range": "stddev: 0.000005617262621366391",
            "extra": "mean: 218.71612337661324 usec\nrounds: 4312"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 3014.198614754349,
            "unit": "iter/sec",
            "range": "stddev: 0.000006462082641567305",
            "extra": "mean: 331.76314099046124 usec\nrounds: 2908"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2881.0362231705362,
            "unit": "iter/sec",
            "range": "stddev: 0.000010334421516237812",
            "extra": "mean: 347.0973367004443 usec\nrounds: 2673"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "68045838+albertobadia@users.noreply.github.com",
            "name": "Alberto Daniel Badia",
            "username": "albertobadia"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "e6c7efa72b5aabb102fbe7f6284d6e10a237f5a7",
          "message": "Merge pull request #5 from albertobadia/dev\n\nNEXT RELEASE",
          "timestamp": "2026-02-11T19:15:45-03:00",
          "tree_id": "2989c312ff510e905efa6162fcdee3eda8211852",
          "url": "https://github.com/albertobadia/zoocache/commit/e6c7efa72b5aabb102fbe7f6284d6e10a237f5a7"
        },
        "date": 1770848293545,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 451809.0317688376,
            "unit": "iter/sec",
            "range": "stddev: 4.314917121439711e-7",
            "extra": "mean: 2.2133245014713148 usec\nrounds: 12493"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.77406899383343,
            "unit": "iter/sec",
            "range": "stddev: 0.00008558312447645885",
            "extra": "mean: 102.31153479998056 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 86385.77468444288,
            "unit": "iter/sec",
            "range": "stddev: 0.000006219567704555299",
            "extra": "mean: 11.575979999634 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 166.60519642367774,
            "unit": "iter/sec",
            "range": "stddev: 0.00010341295378179441",
            "extra": "mean: 6.002213745224343 msec\nrounds: 157"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 180.25552167888807,
            "unit": "iter/sec",
            "range": "stddev: 0.00004572383973093667",
            "extra": "mean: 5.547680263473018 msec\nrounds: 167"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 179.58608256575323,
            "unit": "iter/sec",
            "range": "stddev: 0.00004128728626167258",
            "extra": "mean: 5.568360229885088 msec\nrounds: 174"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1369.043132806491,
            "unit": "iter/sec",
            "range": "stddev: 0.00003638489805489025",
            "extra": "mean: 730.4371761830722 usec\nrounds: 1226"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 157.2937224958686,
            "unit": "iter/sec",
            "range": "stddev: 0.00007702311524889316",
            "extra": "mean: 6.35753279998994 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6414.6476018836065,
            "unit": "iter/sec",
            "range": "stddev: 0.00000896890567451771",
            "extra": "mean: 155.89320911508196 usec\nrounds: 4849"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5264.697246309178,
            "unit": "iter/sec",
            "range": "stddev: 0.0000106147319480666",
            "extra": "mean: 189.94444565659518 usec\nrounds: 4306"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 175.01008878459248,
            "unit": "iter/sec",
            "range": "stddev: 0.0002099829865872345",
            "extra": "mean: 5.713956303575328 msec\nrounds: 56"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 107.49118724896698,
            "unit": "iter/sec",
            "range": "stddev: 0.0006387872557738267",
            "extra": "mean: 9.303088240004627 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 461658.6124102548,
            "unit": "iter/sec",
            "range": "stddev: 6.847083443184261e-7",
            "extra": "mean: 2.1661027718710595 usec\nrounds: 106644"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 463591.63943455217,
            "unit": "iter/sec",
            "range": "stddev: 5.216734308029189e-7",
            "extra": "mean: 2.15707082470191 usec\nrounds: 176026"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 451566.8345222916,
            "unit": "iter/sec",
            "range": "stddev: 7.51886880467309e-7",
            "extra": "mean: 2.2145116150035484 usec\nrounds: 166639"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 460289.0140664281,
            "unit": "iter/sec",
            "range": "stddev: 7.535384361801754e-7",
            "extra": "mean: 2.1725480501163594 usec\nrounds: 157679"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 466602.90820566425,
            "unit": "iter/sec",
            "range": "stddev: 4.285833815637334e-7",
            "extra": "mean: 2.1431499513055554 usec\nrounds: 161239"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 470657.16446960793,
            "unit": "iter/sec",
            "range": "stddev: 4.31430471686118e-7",
            "extra": "mean: 2.124688787276654 usec\nrounds: 121139"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 54.42279585442488,
            "unit": "iter/sec",
            "range": "stddev: 0.0027161065629427873",
            "extra": "mean: 18.374653200010016 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 52.2247983438817,
            "unit": "iter/sec",
            "range": "stddev: 0.0010426160115580862",
            "extra": "mean: 19.147991599993475 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 35.97041511055689,
            "unit": "iter/sec",
            "range": "stddev: 0.008575864676239423",
            "extra": "mean: 27.80062439998119 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 476281.34291720286,
            "unit": "iter/sec",
            "range": "stddev: 4.44502181068022e-7",
            "extra": "mean: 2.09959935418642 usec\nrounds: 185186"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 999840.029811377,
            "unit": "iter/sec",
            "range": "stddev: 3.4627369301801416e-7",
            "extra": "mean: 1.0001599957831786 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 195357.5237780157,
            "unit": "iter/sec",
            "range": "stddev: 0.0000010752313438867586",
            "extra": "mean: 5.118820000689084 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4833.268798108442,
            "unit": "iter/sec",
            "range": "stddev: 0.000007350139736167145",
            "extra": "mean: 206.89931426767785 usec\nrounds: 4773"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4731.575375349614,
            "unit": "iter/sec",
            "range": "stddev: 0.000008865076336206764",
            "extra": "mean: 211.3460994851235 usec\nrounds: 4664"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 3033.6460212350335,
            "unit": "iter/sec",
            "range": "stddev: 0.000009940422702593486",
            "extra": "mean: 329.6363494620536 usec\nrounds: 2976"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2958.318560731196,
            "unit": "iter/sec",
            "range": "stddev: 0.00001171832065794616",
            "extra": "mean: 338.02985698498736 usec\nrounds: 2727"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "albertobadia",
            "username": "albertobadia"
          },
          "committer": {
            "name": "albertobadia",
            "username": "albertobadia"
          },
          "id": "9b34d3bfe1b8d9cd1eb2c836b8a43e0bc2786900",
          "message": "NEXT RELEASE",
          "timestamp": "2026-02-11T22:15:49Z",
          "url": "https://github.com/albertobadia/zoocache/pull/6/commits/9b34d3bfe1b8d9cd1eb2c836b8a43e0bc2786900"
        },
        "date": 1770850661188,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 452396.97249499004,
            "unit": "iter/sec",
            "range": "stddev: 4.6181217233107704e-7",
            "extra": "mean: 2.2104480374502824 usec\nrounds: 11720"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.761540500723966,
            "unit": "iter/sec",
            "range": "stddev: 0.00012107641074862582",
            "extra": "mean: 102.44284700000321 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 75378.39956731918,
            "unit": "iter/sec",
            "range": "stddev: 0.000006574323911672402",
            "extra": "mean: 13.266399999736223 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 166.47293980327012,
            "unit": "iter/sec",
            "range": "stddev: 0.00005153429400251234",
            "extra": "mean: 6.006982283017005 msec\nrounds: 159"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 179.63243514889277,
            "unit": "iter/sec",
            "range": "stddev: 0.00005896105535617634",
            "extra": "mean: 5.566923363094896 msec\nrounds: 168"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 177.31358288917147,
            "unit": "iter/sec",
            "range": "stddev: 0.00009660976246444185",
            "extra": "mean: 5.639725867053527 msec\nrounds: 173"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1362.234744535571,
            "unit": "iter/sec",
            "range": "stddev: 0.000014840336082597414",
            "extra": "mean: 734.0878684906335 usec\nrounds: 1133"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 156.46381024140544,
            "unit": "iter/sec",
            "range": "stddev: 0.00010611867900664467",
            "extra": "mean: 6.391254300001492 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6119.582661100247,
            "unit": "iter/sec",
            "range": "stddev: 0.000025750042872647224",
            "extra": "mean: 163.40983615706384 usec\nrounds: 4840"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5098.10513204377,
            "unit": "iter/sec",
            "range": "stddev: 0.00003984645185994925",
            "extra": "mean: 196.15130996702533 usec\nrounds: 3923"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 172.96988042452384,
            "unit": "iter/sec",
            "range": "stddev: 0.0002848852847062247",
            "extra": "mean: 5.781353363635782 msec\nrounds: 55"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 108.39472790847464,
            "unit": "iter/sec",
            "range": "stddev: 0.00037170395875725927",
            "extra": "mean: 9.225540940001906 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 477791.8005475143,
            "unit": "iter/sec",
            "range": "stddev: 3.907593889886371e-7",
            "extra": "mean: 2.0929618274195447 usec\nrounds: 104080"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 459226.05893277394,
            "unit": "iter/sec",
            "range": "stddev: 9.73354146854908e-7",
            "extra": "mean: 2.1775767741141836 usec\nrounds: 177905"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 456130.1757755971,
            "unit": "iter/sec",
            "range": "stddev: 8.656280196440359e-7",
            "extra": "mean: 2.1923565971043564 usec\nrounds: 116605"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 456301.98483488447,
            "unit": "iter/sec",
            "range": "stddev: 7.917148958913523e-7",
            "extra": "mean: 2.1915311202554943 usec\nrounds: 147428"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 471013.0913911401,
            "unit": "iter/sec",
            "range": "stddev: 4.0275394891004934e-7",
            "extra": "mean: 2.1230832396749184 usec\nrounds: 148523"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 459137.25735037745,
            "unit": "iter/sec",
            "range": "stddev: 4.7022575541531545e-7",
            "extra": "mean: 2.1779979385050834 usec\nrounds: 119818"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 57.49786671413159,
            "unit": "iter/sec",
            "range": "stddev: 0.002205425949168965",
            "extra": "mean: 17.39194960000532 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 51.943178193852916,
            "unit": "iter/sec",
            "range": "stddev: 0.000949473748247347",
            "extra": "mean: 19.251806199997645 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 36.1950010895786,
            "unit": "iter/sec",
            "range": "stddev: 0.009683071633751735",
            "extra": "mean: 27.628124599999637 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 462747.8670108359,
            "unit": "iter/sec",
            "range": "stddev: 5.489116885253273e-7",
            "extra": "mean: 2.161004018148361 usec\nrounds: 180181"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 1039403.7965366028,
            "unit": "iter/sec",
            "range": "stddev: 3.7454082739657283e-7",
            "extra": "mean: 962.0900013374013 nsec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 203848.24716678789,
            "unit": "iter/sec",
            "range": "stddev: 0.0000012850677049217249",
            "extra": "mean: 4.905610001060268 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4754.177409395243,
            "unit": "iter/sec",
            "range": "stddev: 0.000006807226910558137",
            "extra": "mean: 210.34133013711102 usec\nrounds: 4589"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4695.637579686405,
            "unit": "iter/sec",
            "range": "stddev: 0.00001098629729462246",
            "extra": "mean: 212.96362486024407 usec\nrounds: 4473"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 2955.9605353251072,
            "unit": "iter/sec",
            "range": "stddev: 0.00000765176352570423",
            "extra": "mean: 338.29950977001675 usec\nrounds: 2866"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2904.274897982474,
            "unit": "iter/sec",
            "range": "stddev: 0.000007934085330766291",
            "extra": "mean: 344.3200231130581 usec\nrounds: 2769"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "68045838+albertobadia@users.noreply.github.com",
            "name": "Alberto Daniel Badia",
            "username": "albertobadia"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "6a44bf01fc1c53c607bab86720593de64d17938f",
          "message": "Merge pull request #6 from albertobadia/dev\n\nNEXT RELEASE",
          "timestamp": "2026-02-11T19:58:00-03:00",
          "tree_id": "a60e5520d93785159967926e0501e21cd4ef52b2",
          "url": "https://github.com/albertobadia/zoocache/commit/6a44bf01fc1c53c607bab86720593de64d17938f"
        },
        "date": 1770850825935,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 454168.96580867894,
            "unit": "iter/sec",
            "range": "stddev: 4.69773020981575e-7",
            "extra": "mean: 2.201823716024787 usec\nrounds: 12928"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.78133787871864,
            "unit": "iter/sec",
            "range": "stddev: 0.00011434287985411713",
            "extra": "mean: 102.23550319999788 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 128406.79272158492,
            "unit": "iter/sec",
            "range": "stddev: 0.000008113039281641494",
            "extra": "mean: 7.787749999863537 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 166.43028089772685,
            "unit": "iter/sec",
            "range": "stddev: 0.00008761539050832732",
            "extra": "mean: 6.008521974522837 msec\nrounds: 157"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 180.40841955593524,
            "unit": "iter/sec",
            "range": "stddev: 0.000053334346887487764",
            "extra": "mean: 5.542978550898242 msec\nrounds: 167"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 179.8456493110321,
            "unit": "iter/sec",
            "range": "stddev: 0.00003527894592654195",
            "extra": "mean: 5.560323554286048 msec\nrounds: 175"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1369.9558389361034,
            "unit": "iter/sec",
            "range": "stddev: 0.000018329131192515974",
            "extra": "mean: 729.9505367826979 usec\nrounds: 1237"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 157.37385093082437,
            "unit": "iter/sec",
            "range": "stddev: 0.00011721359128210375",
            "extra": "mean: 6.354295800002774 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6272.3434738234655,
            "unit": "iter/sec",
            "range": "stddev: 0.00000909092444869081",
            "extra": "mean: 159.43004463536255 usec\nrounds: 4772"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5158.876087961079,
            "unit": "iter/sec",
            "range": "stddev: 0.00001013894517562636",
            "extra": "mean: 193.84067051612897 usec\nrounds: 4243"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 174.21628834366084,
            "unit": "iter/sec",
            "range": "stddev: 0.000265352184825396",
            "extra": "mean: 5.739991418181231 msec\nrounds: 55"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 104.43132654237662,
            "unit": "iter/sec",
            "range": "stddev: 0.0002606114978589508",
            "extra": "mean: 9.575670760001458 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 481841.44894908386,
            "unit": "iter/sec",
            "range": "stddev: 4.3213747741444423e-7",
            "extra": "mean: 2.0753714778606978 usec\nrounds: 132732"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 470358.02585930336,
            "unit": "iter/sec",
            "range": "stddev: 4.3920963885457915e-7",
            "extra": "mean: 2.1260400482655455 usec\nrounds: 181456"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 463077.47145178425,
            "unit": "iter/sec",
            "range": "stddev: 7.470369063492963e-7",
            "extra": "mean: 2.159465881302585 usec\nrounds: 174186"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 461362.2890849686,
            "unit": "iter/sec",
            "range": "stddev: 7.417054368387913e-7",
            "extra": "mean: 2.167494014266586 usec\nrounds: 157208"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 457926.6573160223,
            "unit": "iter/sec",
            "range": "stddev: 6.516515266421507e-7",
            "extra": "mean: 2.183755813346076 usec\nrounds: 149656"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 455855.14225738175,
            "unit": "iter/sec",
            "range": "stddev: 5.476645395641811e-7",
            "extra": "mean: 2.1936793233219403 usec\nrounds: 141164"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 53.74626748296815,
            "unit": "iter/sec",
            "range": "stddev: 0.0024225141982961787",
            "extra": "mean: 18.60594319999791 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 55.825281606453466,
            "unit": "iter/sec",
            "range": "stddev: 0.0007061223641017811",
            "extra": "mean: 17.91303099999766 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 37.03050924400975,
            "unit": "iter/sec",
            "range": "stddev: 0.00875613964944981",
            "extra": "mean: 27.00475959999835 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 485279.8529368699,
            "unit": "iter/sec",
            "range": "stddev: 4.522105906309946e-7",
            "extra": "mean: 2.0606666317344318 usec\nrounds: 190840"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 1031491.4329785947,
            "unit": "iter/sec",
            "range": "stddev: 3.5919566212873845e-7",
            "extra": "mean: 969.4700004558854 nsec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 192624.04023942276,
            "unit": "iter/sec",
            "range": "stddev: 0.0000018393859666053658",
            "extra": "mean: 5.19146000030446 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4819.228237220798,
            "unit": "iter/sec",
            "range": "stddev: 0.000011285939496700616",
            "extra": "mean: 207.50210423250056 usec\nrounds: 4749"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4725.017001260512,
            "unit": "iter/sec",
            "range": "stddev: 0.000006248635021541624",
            "extra": "mean: 211.6394501296452 usec\nrounds: 4632"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 3080.2690370486266,
            "unit": "iter/sec",
            "range": "stddev: 0.000006481434769875682",
            "extra": "mean: 324.6469668630486 usec\nrounds: 2716"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2957.7757692509226,
            "unit": "iter/sec",
            "range": "stddev: 0.000015051725730040721",
            "extra": "mean: 338.09188999247806 usec\nrounds: 2618"
          }
        ]
      }
    ]
  }
}