window.BENCHMARK_DATA = {
  "lastUpdate": 1771050435798,
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
      },
      {
        "commit": {
          "author": {
            "email": "alberto_badia@enlacepatagonia.com",
            "name": "Alberto Daniel Badia",
            "username": "albertobadia"
          },
          "committer": {
            "email": "alberto_badia@enlacepatagonia.com",
            "name": "Alberto Daniel Badia",
            "username": "albertobadia"
          },
          "distinct": true,
          "id": "6a8ad700725591d33d7ee674385e298b2a37e658",
          "message": "UPDATE: Release",
          "timestamp": "2026-02-11T20:06:17-03:00",
          "tree_id": "d15296fbe1d1f9d01943bb19cae779f0ee1b69ca",
          "url": "https://github.com/albertobadia/zoocache/commit/6a8ad700725591d33d7ee674385e298b2a37e658"
        },
        "date": 1770851327117,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 448055.67972893646,
            "unit": "iter/sec",
            "range": "stddev: 4.0441721466137484e-7",
            "extra": "mean: 2.2318654694991866 usec\nrounds: 17654"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.778159722256278,
            "unit": "iter/sec",
            "range": "stddev: 0.00013271278192108544",
            "extra": "mean: 102.26873240001169 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 77003.16021713965,
            "unit": "iter/sec",
            "range": "stddev: 0.000008226771524301788",
            "extra": "mean: 12.986479998744471 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 166.4448022828279,
            "unit": "iter/sec",
            "range": "stddev: 0.000054284671309697796",
            "extra": "mean: 6.007997764332529 msec\nrounds: 157"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 179.58819632615015,
            "unit": "iter/sec",
            "range": "stddev: 0.00003710722308786899",
            "extra": "mean: 5.568294690058025 msec\nrounds: 171"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 179.23356436124345,
            "unit": "iter/sec",
            "range": "stddev: 0.00004126375709458054",
            "extra": "mean: 5.579312131429301 msec\nrounds: 175"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1356.8131252773996,
            "unit": "iter/sec",
            "range": "stddev: 0.00002103162167905949",
            "extra": "mean: 737.0211721644058 usec\nrounds: 1243"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 156.05131010775213,
            "unit": "iter/sec",
            "range": "stddev: 0.00008892918214501338",
            "extra": "mean: 6.408148699998151 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6343.81832585578,
            "unit": "iter/sec",
            "range": "stddev: 0.000009230932301271284",
            "extra": "mean: 157.6337701734389 usec\nrounds: 4895"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5200.685318093326,
            "unit": "iter/sec",
            "range": "stddev: 0.000018891661017013786",
            "extra": "mean: 192.2823510434236 usec\nrounds: 4216"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 173.96111460021032,
            "unit": "iter/sec",
            "range": "stddev: 0.00023841655890297577",
            "extra": "mean: 5.748411087720123 msec\nrounds: 57"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 116.41371197161244,
            "unit": "iter/sec",
            "range": "stddev: 0.00022539595521304934",
            "extra": "mean: 8.590053379999176 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 470792.419132399,
            "unit": "iter/sec",
            "range": "stddev: 4.1738667773935756e-7",
            "extra": "mean: 2.124078382236597 usec\nrounds: 131165"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 464300.5237124441,
            "unit": "iter/sec",
            "range": "stddev: 4.421661836479695e-7",
            "extra": "mean: 2.153777454318211 usec\nrounds: 174490"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 449563.83993387973,
            "unit": "iter/sec",
            "range": "stddev: 6.853266972250843e-7",
            "extra": "mean: 2.224378188750849 usec\nrounds: 164447"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 461172.3918154575,
            "unit": "iter/sec",
            "range": "stddev: 4.318574557048938e-7",
            "extra": "mean: 2.1683865247513765 usec\nrounds: 167477"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 462902.30895998515,
            "unit": "iter/sec",
            "range": "stddev: 4.475110870644572e-7",
            "extra": "mean: 2.1602830243960685 usec\nrounds: 146157"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 475505.0444832446,
            "unit": "iter/sec",
            "range": "stddev: 4.350025758860495e-7",
            "extra": "mean: 2.103027111072503 usec\nrounds: 111025"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 52.96188269747762,
            "unit": "iter/sec",
            "range": "stddev: 0.0028488377742781805",
            "extra": "mean: 18.88150400000086 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 51.99069187765504,
            "unit": "iter/sec",
            "range": "stddev: 0.0007586577719193439",
            "extra": "mean: 19.23421220000705 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 35.54184076481249,
            "unit": "iter/sec",
            "range": "stddev: 0.010135320607230732",
            "extra": "mean: 28.135852800005523 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 468603.52294162737,
            "unit": "iter/sec",
            "range": "stddev: 4.329195644679737e-7",
            "extra": "mean: 2.1340001750788526 usec\nrounds: 182782"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 1091738.8111262724,
            "unit": "iter/sec",
            "range": "stddev: 3.0801664388181977e-7",
            "extra": "mean: 915.970001074129 nsec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 217319.96676091917,
            "unit": "iter/sec",
            "range": "stddev: 9.577566000870177e-7",
            "extra": "mean: 4.601509998849451 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4739.505521486602,
            "unit": "iter/sec",
            "range": "stddev: 0.000013740363490880323",
            "extra": "mean: 210.99247494627627 usec\nrounds: 4630"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4673.711117828389,
            "unit": "iter/sec",
            "range": "stddev: 0.000006006234805202336",
            "extra": "mean: 213.96273213921782 usec\nrounds: 4633"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 3031.9068609374326,
            "unit": "iter/sec",
            "range": "stddev: 0.000022954090418981134",
            "extra": "mean: 329.8254352347786 usec\nrounds: 2980"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2956.657440705277,
            "unit": "iter/sec",
            "range": "stddev: 0.000007653852742410517",
            "extra": "mean: 338.21977014742066 usec\nrounds: 2854"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "alberto_badia@enlacepatagonia.com",
            "name": "Alberto Daniel Badia",
            "username": "albertobadia"
          },
          "committer": {
            "email": "alberto_badia@enlacepatagonia.com",
            "name": "Alberto Daniel Badia",
            "username": "albertobadia"
          },
          "distinct": true,
          "id": "6a8ad700725591d33d7ee674385e298b2a37e658",
          "message": "UPDATE: Release",
          "timestamp": "2026-02-11T20:06:17-03:00",
          "tree_id": "d15296fbe1d1f9d01943bb19cae779f0ee1b69ca",
          "url": "https://github.com/albertobadia/zoocache/commit/6a8ad700725591d33d7ee674385e298b2a37e658"
        },
        "date": 1770851534892,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 449290.55213531485,
            "unit": "iter/sec",
            "range": "stddev: 5.718073020049034e-7",
            "extra": "mean: 2.2257312005502077 usec\nrounds: 12128"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.774483736789994,
            "unit": "iter/sec",
            "range": "stddev: 0.0000904405329183853",
            "extra": "mean: 102.30719360001785 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 102920.89491866824,
            "unit": "iter/sec",
            "range": "stddev: 0.000006274411965742037",
            "extra": "mean: 9.716200007687803 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 166.38967431366635,
            "unit": "iter/sec",
            "range": "stddev: 0.00004759313104219965",
            "extra": "mean: 6.0099883248456205 msec\nrounds: 157"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 179.54684194031915,
            "unit": "iter/sec",
            "range": "stddev: 0.00006861493320568253",
            "extra": "mean: 5.569577215579192 msec\nrounds: 167"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 179.62779931356965,
            "unit": "iter/sec",
            "range": "stddev: 0.000042456800328724796",
            "extra": "mean: 5.567067034286473 msec\nrounds: 175"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1359.1866539233188,
            "unit": "iter/sec",
            "range": "stddev: 0.000013264193034591357",
            "extra": "mean: 735.7341223984804 usec\nrounds: 1250"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 156.10523922151148,
            "unit": "iter/sec",
            "range": "stddev: 0.0000821556970328145",
            "extra": "mean: 6.405934899987642 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6283.65076055275,
            "unit": "iter/sec",
            "range": "stddev: 0.000008458833545331407",
            "extra": "mean: 159.14315389355497 usec\nrounds: 4971"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5149.372486673553,
            "unit": "iter/sec",
            "range": "stddev: 0.000012888784324801979",
            "extra": "mean: 194.19841982454656 usec\nrounds: 4328"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 174.90855616713537,
            "unit": "iter/sec",
            "range": "stddev: 0.0002338438017338518",
            "extra": "mean: 5.717273196426374 msec\nrounds: 56"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 104.94777789127825,
            "unit": "iter/sec",
            "range": "stddev: 0.00042884606821646165",
            "extra": "mean: 9.528548579999097 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 469979.65320281405,
            "unit": "iter/sec",
            "range": "stddev: 5.072632298741858e-7",
            "extra": "mean: 2.1277516870894453 usec\nrounds: 90245"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 464472.19361584506,
            "unit": "iter/sec",
            "range": "stddev: 4.579319494817407e-7",
            "extra": "mean: 2.152981413623823 usec\nrounds: 180506"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 454262.4428781103,
            "unit": "iter/sec",
            "range": "stddev: 7.517232675369749e-7",
            "extra": "mean: 2.201370629859278 usec\nrounds: 160721"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 463423.54454270547,
            "unit": "iter/sec",
            "range": "stddev: 4.2404755214014303e-7",
            "extra": "mean: 2.1578532462928153 usec\nrounds: 164691"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 470179.6227466446,
            "unit": "iter/sec",
            "range": "stddev: 4.226766170596525e-7",
            "extra": "mean: 2.1268467445660613 usec\nrounds: 135245"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 468208.97763365373,
            "unit": "iter/sec",
            "range": "stddev: 4.342889003922409e-7",
            "extra": "mean: 2.1357984314056484 usec\nrounds: 148302"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 55.86647483461411,
            "unit": "iter/sec",
            "range": "stddev: 0.0022775275758094068",
            "extra": "mean: 17.89982279999549 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 54.731360857339006,
            "unit": "iter/sec",
            "range": "stddev: 0.0005580893262908828",
            "extra": "mean: 18.271060400024908 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 36.15863112563507,
            "unit": "iter/sec",
            "range": "stddev: 0.009407480198341282",
            "extra": "mean: 27.655914199999643 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 477730.425379582,
            "unit": "iter/sec",
            "range": "stddev: 4.4297800335499217e-7",
            "extra": "mean: 2.0932307152207175 usec\nrounds: 183824"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 1059782.320050582,
            "unit": "iter/sec",
            "range": "stddev: 3.3350877684087616e-7",
            "extra": "mean: 943.5900005883013 nsec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 204667.65045354387,
            "unit": "iter/sec",
            "range": "stddev: 0.0000012470944301312177",
            "extra": "mean: 4.885969999577355 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4795.725947411077,
            "unit": "iter/sec",
            "range": "stddev: 0.000008531222224242461",
            "extra": "mean: 208.51900441472048 usec\nrounds: 4757"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4513.2075911374695,
            "unit": "iter/sec",
            "range": "stddev: 0.00003542638716183384",
            "extra": "mean: 221.57190419596205 usec\nrounds: 4624"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 3039.5110889838306,
            "unit": "iter/sec",
            "range": "stddev: 0.000019084232565237534",
            "extra": "mean: 329.00028021753985 usec\nrounds: 2937"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2941.885024019845,
            "unit": "iter/sec",
            "range": "stddev: 0.00000741878078334483",
            "extra": "mean: 339.9181109510466 usec\nrounds: 2794"
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
          "id": "4a17e7492512e0ae594a05fc9ca1a3b80573dcdd",
          "message": "NEXT RELEASE",
          "timestamp": "2026-02-12T22:02:29Z",
          "url": "https://github.com/albertobadia/zoocache/pull/7/commits/4a17e7492512e0ae594a05fc9ca1a3b80573dcdd"
        },
        "date": 1770968947170,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 440061.4650372629,
            "unit": "iter/sec",
            "range": "stddev: 4.4576859098167706e-7",
            "extra": "mean: 2.2724098323749464 usec\nrounds: 15521"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.773955712795052,
            "unit": "iter/sec",
            "range": "stddev: 0.00015953518896606492",
            "extra": "mean: 102.31272060000265 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 83719.76989657099,
            "unit": "iter/sec",
            "range": "stddev: 0.000008529255246269823",
            "extra": "mean: 11.94460999158764 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 166.01523981293036,
            "unit": "iter/sec",
            "range": "stddev: 0.0000949313705685585",
            "extra": "mean: 6.023543387503594 msec\nrounds: 160"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 179.81805489009932,
            "unit": "iter/sec",
            "range": "stddev: 0.000049739733691747926",
            "extra": "mean: 5.561176827383531 msec\nrounds: 168"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 178.83090157681153,
            "unit": "iter/sec",
            "range": "stddev: 0.00006540457475640993",
            "extra": "mean: 5.591874732960956 msec\nrounds: 176"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1106.1255834759381,
            "unit": "iter/sec",
            "range": "stddev: 0.00001535777133809091",
            "extra": "mean: 904.0564787024957 usec\nrounds: 986"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 142.90651093235982,
            "unit": "iter/sec",
            "range": "stddev: 0.00010061648243503201",
            "extra": "mean: 6.997581799987529 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6336.155776922501,
            "unit": "iter/sec",
            "range": "stddev: 0.00001296838819352822",
            "extra": "mean: 157.82440255686146 usec\nrounds: 4926"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5217.135366659765,
            "unit": "iter/sec",
            "range": "stddev: 0.00001070929014328819",
            "extra": "mean: 191.67606928325557 usec\nrounds: 4229"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 174.62493365534266,
            "unit": "iter/sec",
            "range": "stddev: 0.00026135294904154057",
            "extra": "mean: 5.726559083330566 msec\nrounds: 48"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 113.80500558396875,
            "unit": "iter/sec",
            "range": "stddev: 0.0003181273491788865",
            "extra": "mean: 8.786959719993774 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 465520.3313614328,
            "unit": "iter/sec",
            "range": "stddev: 4.3782564938767733e-7",
            "extra": "mean: 2.1481338893952495 usec\nrounds: 130481"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 460704.5452384906,
            "unit": "iter/sec",
            "range": "stddev: 4.369178338234488e-7",
            "extra": "mean: 2.170588526497682 usec\nrounds: 174490"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 447397.4029697151,
            "unit": "iter/sec",
            "range": "stddev: 8.636846468859176e-7",
            "extra": "mean: 2.2351493177256803 usec\nrounds: 155715"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 447321.8706071973,
            "unit": "iter/sec",
            "range": "stddev: 8.343804365302281e-7",
            "extra": "mean: 2.2355267330045683 usec\nrounds: 157184"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 461719.12540925044,
            "unit": "iter/sec",
            "range": "stddev: 4.363767423501334e-7",
            "extra": "mean: 2.165818882017585 usec\nrounds: 141985"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 459023.95894568105,
            "unit": "iter/sec",
            "range": "stddev: 4.348547952047614e-7",
            "extra": "mean: 2.1785355219733438 usec\nrounds: 140786"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 51.39546922210891,
            "unit": "iter/sec",
            "range": "stddev: 0.0026472715500353034",
            "extra": "mean: 19.4569680000086 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 45.07627396885012,
            "unit": "iter/sec",
            "range": "stddev: 0.00011541347354704058",
            "extra": "mean: 22.184619800009386 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 33.19449889080811,
            "unit": "iter/sec",
            "range": "stddev: 0.00851220632635357",
            "extra": "mean: 30.125473599991892 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 457924.8193662953,
            "unit": "iter/sec",
            "range": "stddev: 0.000001488577056254449",
            "extra": "mean: 2.1837645781765267 usec\nrounds: 181160"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 1044833.8242230099,
            "unit": "iter/sec",
            "range": "stddev: 3.236731457962188e-7",
            "extra": "mean: 957.0899953814661 nsec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 191833.64166000736,
            "unit": "iter/sec",
            "range": "stddev: 0.0000020950883569549007",
            "extra": "mean: 5.212850005591463 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4688.938735570147,
            "unit": "iter/sec",
            "range": "stddev: 0.0000075193525680242356",
            "extra": "mean: 213.26787497009298 usec\nrounds: 4343"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4592.01292865617,
            "unit": "iter/sec",
            "range": "stddev: 0.000006171741630281871",
            "extra": "mean: 217.76942171908152 usec\nrounds: 4420"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 3019.940358652665,
            "unit": "iter/sec",
            "range": "stddev: 0.00001289601201038482",
            "extra": "mean: 331.1323672783214 usec\nrounds: 2946"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2877.097525351683,
            "unit": "iter/sec",
            "range": "stddev: 0.000021957648224699002",
            "extra": "mean: 347.5725070799484 usec\nrounds: 2613"
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
          "id": "732edc7de2b42fb4205bc5481137b9efa2cc077c",
          "message": "NEXT RELEASE",
          "timestamp": "2026-02-12T22:02:29Z",
          "url": "https://github.com/albertobadia/zoocache/pull/7/commits/732edc7de2b42fb4205bc5481137b9efa2cc077c"
        },
        "date": 1770970926430,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 440561.71939268656,
            "unit": "iter/sec",
            "range": "stddev: 4.619867993604672e-7",
            "extra": "mean: 2.2698295289443164 usec\nrounds: 13275"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.768932604125022,
            "unit": "iter/sec",
            "range": "stddev: 0.00009540731180027751",
            "extra": "mean: 102.36532899999133 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 78431.18799871368,
            "unit": "iter/sec",
            "range": "stddev: 0.000008675264085624263",
            "extra": "mean: 12.7500300010297 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 166.3529484930073,
            "unit": "iter/sec",
            "range": "stddev: 0.00004969072553669348",
            "extra": "mean: 6.011315152866289 msec\nrounds: 157"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 180.41961823995476,
            "unit": "iter/sec",
            "range": "stddev: 0.00003503091304263081",
            "extra": "mean: 5.542634497042436 msec\nrounds: 169"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 179.84431098712184,
            "unit": "iter/sec",
            "range": "stddev: 0.00004936989583838878",
            "extra": "mean: 5.560364931819318 msec\nrounds: 176"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1090.2094053747412,
            "unit": "iter/sec",
            "range": "stddev: 0.000013331299606361186",
            "extra": "mean: 917.2549742003617 usec\nrounds: 969"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 146.34735585887,
            "unit": "iter/sec",
            "range": "stddev: 0.0001247064905624267",
            "extra": "mean: 6.833058200001574 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6319.080394422095,
            "unit": "iter/sec",
            "range": "stddev: 0.000008948128326788259",
            "extra": "mean: 158.250874744798 usec\nrounds: 4902"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5170.000806324697,
            "unit": "iter/sec",
            "range": "stddev: 0.000010386369953724614",
            "extra": "mean: 193.42356751214712 usec\nrounds: 3940"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 175.4330750941991,
            "unit": "iter/sec",
            "range": "stddev: 0.00032284697465356646",
            "extra": "mean: 5.70017939583541 msec\nrounds: 48"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 108.6853752628515,
            "unit": "iter/sec",
            "range": "stddev: 0.00041783210455403826",
            "extra": "mean: 9.200869920001082 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 473026.4960111314,
            "unit": "iter/sec",
            "range": "stddev: 4.76047154648592e-7",
            "extra": "mean: 2.1140464824542677 usec\nrounds: 110902"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 456456.47574298613,
            "unit": "iter/sec",
            "range": "stddev: 4.5248673005895285e-7",
            "extra": "mean: 2.1907893811173866 usec\nrounds: 167758"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 444237.6519150804,
            "unit": "iter/sec",
            "range": "stddev: 9.778416137028782e-7",
            "extra": "mean: 2.251047374505658 usec\nrounds: 141764"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 460279.0636361219,
            "unit": "iter/sec",
            "range": "stddev: 4.5838085904202617e-7",
            "extra": "mean: 2.1725950168147548 usec\nrounds: 138065"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 465829.35331729916,
            "unit": "iter/sec",
            "range": "stddev: 4.5050714399909086e-7",
            "extra": "mean: 2.1467088599692667 usec\nrounds: 144865"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 465749.8035373316,
            "unit": "iter/sec",
            "range": "stddev: 4.4860395214019605e-7",
            "extra": "mean: 2.1470755165221367 usec\nrounds: 146564"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 50.38759346195384,
            "unit": "iter/sec",
            "range": "stddev: 0.0024180949749849925",
            "extra": "mean: 19.846155199991244 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 47.13564687030185,
            "unit": "iter/sec",
            "range": "stddev: 0.000784864725297499",
            "extra": "mean: 21.215365999995583 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 32.430055116565235,
            "unit": "iter/sec",
            "range": "stddev: 0.00947476200810942",
            "extra": "mean: 30.83559359999981 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 467870.1519936549,
            "unit": "iter/sec",
            "range": "stddev: 4.207382896945377e-7",
            "extra": "mean: 2.1373451495866354 usec\nrounds: 178540"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 1003885.0341935023,
            "unit": "iter/sec",
            "range": "stddev: 3.050485509994325e-7",
            "extra": "mean: 996.1300008853868 nsec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 191146.4774220539,
            "unit": "iter/sec",
            "range": "stddev: 0.0000019979471827698884",
            "extra": "mean: 5.231590000960296 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4766.665183089339,
            "unit": "iter/sec",
            "range": "stddev: 0.0000071774503501918335",
            "extra": "mean: 209.79027508533477 usec\nrounds: 4664"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4642.810048714537,
            "unit": "iter/sec",
            "range": "stddev: 0.00001861858774651875",
            "extra": "mean: 215.38680012913125 usec\nrounds: 4633"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 2972.571257428605,
            "unit": "iter/sec",
            "range": "stddev: 0.000009160827166355942",
            "extra": "mean: 336.4090928017116 usec\nrounds: 2834"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2841.43198056087,
            "unit": "iter/sec",
            "range": "stddev: 0.000028392018562797724",
            "extra": "mean: 351.93522380310856 usec\nrounds: 2319"
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
          "id": "260910e7dbd9b78df0f0558ef8d821711588501a",
          "message": "NEXT RELEASE",
          "timestamp": "2026-02-14T00:31:47Z",
          "url": "https://github.com/albertobadia/zoocache/pull/7/commits/260910e7dbd9b78df0f0558ef8d821711588501a"
        },
        "date": 1771049054317,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 445978.081879727,
            "unit": "iter/sec",
            "range": "stddev: 4.3643329105082375e-7",
            "extra": "mean: 2.2422626596023694 usec\nrounds: 16055"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.750118426888958,
            "unit": "iter/sec",
            "range": "stddev: 0.00032833636604982937",
            "extra": "mean: 102.5628567999945 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 110306.48657540511,
            "unit": "iter/sec",
            "range": "stddev: 0.000005818636163565053",
            "extra": "mean: 9.065649999797643 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 166.70774728916567,
            "unit": "iter/sec",
            "range": "stddev: 0.00008686584234871014",
            "extra": "mean: 5.998521462025598 msec\nrounds: 158"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 180.05892437775134,
            "unit": "iter/sec",
            "range": "stddev: 0.000052267037926329076",
            "extra": "mean: 5.553737497076614 msec\nrounds: 171"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 179.70928523406621,
            "unit": "iter/sec",
            "range": "stddev: 0.000054134700823660905",
            "extra": "mean: 5.56454274857044 msec\nrounds: 175"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1041.2418279993583,
            "unit": "iter/sec",
            "range": "stddev: 0.000018227835117768182",
            "extra": "mean: 960.3916910650811 usec\nrounds: 929"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 145.0836609697461,
            "unit": "iter/sec",
            "range": "stddev: 0.00006743514472664489",
            "extra": "mean: 6.892574899998749 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6378.160176937965,
            "unit": "iter/sec",
            "range": "stddev: 0.000008724801833831284",
            "extra": "mean: 156.78502456175084 usec\nrounds: 4967"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5225.301818523926,
            "unit": "iter/sec",
            "range": "stddev: 0.000010908636967707408",
            "extra": "mean: 191.37650507669352 usec\nrounds: 4235"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 172.78624266985312,
            "unit": "iter/sec",
            "range": "stddev: 0.00025519115635442945",
            "extra": "mean: 5.787497803923685 msec\nrounds: 51"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 109.85634270621189,
            "unit": "iter/sec",
            "range": "stddev: 0.00041319607331857127",
            "extra": "mean: 9.102797120001469 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 461478.40013740485,
            "unit": "iter/sec",
            "range": "stddev: 4.145500941708767e-7",
            "extra": "mean: 2.1669486582736064 usec\nrounds: 97192"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 453305.55733720714,
            "unit": "iter/sec",
            "range": "stddev: 4.895227122195184e-7",
            "extra": "mean: 2.2060175169132443 usec\nrounds: 166639"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 456222.21150851727,
            "unit": "iter/sec",
            "range": "stddev: 4.532174977997013e-7",
            "extra": "mean: 2.1919143232712397 usec\nrounds: 166918"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 441608.0396099162,
            "unit": "iter/sec",
            "range": "stddev: 9.308073495622992e-7",
            "extra": "mean: 2.2644515278375046 usec\nrounds: 168891"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 456686.40972642845,
            "unit": "iter/sec",
            "range": "stddev: 4.684782906560913e-7",
            "extra": "mean: 2.189686355236706 usec\nrounds: 126503"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 436366.7037897364,
            "unit": "iter/sec",
            "range": "stddev: 5.77614489808426e-7",
            "extra": "mean: 2.2916505574674892 usec\nrounds: 137685"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 48.68775591746423,
            "unit": "iter/sec",
            "range": "stddev: 0.0022066480309072436",
            "extra": "mean: 20.5390447999946 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 52.07412760397197,
            "unit": "iter/sec",
            "range": "stddev: 0.0008389978561995714",
            "extra": "mean: 19.203394199996637 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 32.97880132544927,
            "unit": "iter/sec",
            "range": "stddev: 0.011172621304795752",
            "extra": "mean: 30.322508999995534 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 460184.8227860193,
            "unit": "iter/sec",
            "range": "stddev: 4.7298355634909777e-7",
            "extra": "mean: 2.1730399406609475 usec\nrounds: 173883"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 997396.7932352893,
            "unit": "iter/sec",
            "range": "stddev: 3.547272649139238e-7",
            "extra": "mean: 1.0026100011373273 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 186367.23655653175,
            "unit": "iter/sec",
            "range": "stddev: 0.000002395597546026027",
            "extra": "mean: 5.3657500023973626 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4587.5304115995095,
            "unit": "iter/sec",
            "range": "stddev: 0.000010785164680484643",
            "extra": "mean: 217.98220617165032 usec\nrounds: 4472"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4512.613354412883,
            "unit": "iter/sec",
            "range": "stddev: 0.0000074170705174770475",
            "extra": "mean: 221.6010815600012 usec\nrounds: 4463"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 2969.3114993350346,
            "unit": "iter/sec",
            "range": "stddev: 0.00000830042140435209",
            "extra": "mean: 336.7784081339886 usec\nrounds: 2803"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2852.3517028807155,
            "unit": "iter/sec",
            "range": "stddev: 0.00002028264300832725",
            "extra": "mean: 350.5879022527467 usec\nrounds: 2619"
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
          "id": "d1b7d76e636664157764054fbc60b56d687c89c8",
          "message": "NEXT RELEASE",
          "timestamp": "2026-02-14T00:31:47Z",
          "url": "https://github.com/albertobadia/zoocache/pull/7/commits/d1b7d76e636664157764054fbc60b56d687c89c8"
        },
        "date": 1771049420248,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 440150.8804422016,
            "unit": "iter/sec",
            "range": "stddev: 3.7096478933415994e-7",
            "extra": "mean: 2.2719481987525296 usec\nrounds: 12741"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.771399305362273,
            "unit": "iter/sec",
            "range": "stddev: 0.00018296343826937163",
            "extra": "mean: 102.3394877999948 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 117725.58870651947,
            "unit": "iter/sec",
            "range": "stddev: 0.00000345654482470286",
            "extra": "mean: 8.494330000701211 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 167.43432917166697,
            "unit": "iter/sec",
            "range": "stddev: 0.00005053753104791272",
            "extra": "mean: 5.972490856249202 msec\nrounds: 160"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 179.5333257896755,
            "unit": "iter/sec",
            "range": "stddev: 0.00005915676709025701",
            "extra": "mean: 5.5699965207100695 msec\nrounds: 169"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 179.52323759981,
            "unit": "iter/sec",
            "range": "stddev: 0.00005237046402169338",
            "extra": "mean: 5.570309522988786 msec\nrounds: 174"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1036.0924405662756,
            "unit": "iter/sec",
            "range": "stddev: 0.00003108901125551323",
            "extra": "mean: 965.1648451883798 usec\nrounds: 956"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 146.47077567475782,
            "unit": "iter/sec",
            "range": "stddev: 0.00010298960374599692",
            "extra": "mean: 6.827300500002309 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6244.178169676911,
            "unit": "iter/sec",
            "range": "stddev: 0.000008853669384394204",
            "extra": "mean: 160.14917781433877 usec\nrounds: 4859"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5190.676233786943,
            "unit": "iter/sec",
            "range": "stddev: 0.000010499339232486681",
            "extra": "mean: 192.65312551972318 usec\nrounds: 3848"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 173.47076656005723,
            "unit": "iter/sec",
            "range": "stddev: 0.00039591356782769715",
            "extra": "mean: 5.764660062499871 msec\nrounds: 48"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 115.01228487618793,
            "unit": "iter/sec",
            "range": "stddev: 0.00028051297176739855",
            "extra": "mean: 8.694723360000296 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 464314.4523668125,
            "unit": "iter/sec",
            "range": "stddev: 5.616770739930997e-7",
            "extra": "mean: 2.1537128446090046 usec\nrounds: 120541"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 452688.53387113515,
            "unit": "iter/sec",
            "range": "stddev: 4.844328462158417e-7",
            "extra": "mean: 2.2090243626198527 usec\nrounds: 158932"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 444640.2632873231,
            "unit": "iter/sec",
            "range": "stddev: 6.418296128846986e-7",
            "extra": "mean: 2.249009103689307 usec\nrounds: 169492"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 445268.75369362166,
            "unit": "iter/sec",
            "range": "stddev: 6.309496065562515e-7",
            "extra": "mean: 2.2458346598649386 usec\nrounds: 146371"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 457722.6004207834,
            "unit": "iter/sec",
            "range": "stddev: 5.790450371448467e-7",
            "extra": "mean: 2.184729351534537 usec\nrounds: 143001"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 458186.151824277,
            "unit": "iter/sec",
            "range": "stddev: 6.881961282074072e-7",
            "extra": "mean: 2.1825190395180667 usec\nrounds: 115943"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 50.914863210444686,
            "unit": "iter/sec",
            "range": "stddev: 0.0024308818988916818",
            "extra": "mean: 19.640630200001397 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 46.31160614142251,
            "unit": "iter/sec",
            "range": "stddev: 0.0008460934229602913",
            "extra": "mean: 21.592859400001885 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 33.940143041550115,
            "unit": "iter/sec",
            "range": "stddev: 0.008072971493356486",
            "extra": "mean: 29.463635399997656 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 472991.09621377056,
            "unit": "iter/sec",
            "range": "stddev: 4.6155353550818394e-7",
            "extra": "mean: 2.114204702804903 usec\nrounds: 171175"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 979470.3025371557,
            "unit": "iter/sec",
            "range": "stddev: 3.5007554449272076e-7",
            "extra": "mean: 1.0209599999200236 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 196405.38859908195,
            "unit": "iter/sec",
            "range": "stddev: 0.0000016406750980551839",
            "extra": "mean: 5.091509999459731 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4787.645366909938,
            "unit": "iter/sec",
            "range": "stddev: 0.000009225426515206619",
            "extra": "mean: 208.87094247029077 usec\nrounds: 4728"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4655.420206435089,
            "unit": "iter/sec",
            "range": "stddev: 0.00012002246332617785",
            "extra": "mean: 214.80338093169786 usec\nrounds: 4615"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 2978.188065399823,
            "unit": "iter/sec",
            "range": "stddev: 0.000009739980762122221",
            "extra": "mean: 335.7746314337438 usec\nrounds: 2895"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2908.079972088264,
            "unit": "iter/sec",
            "range": "stddev: 0.00000866483407156009",
            "extra": "mean: 343.86949794984827 usec\nrounds: 2683"
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
          "id": "2364a7f0480ceb2c3b582beb91223aa802a55686",
          "message": "NEXT RELEASE",
          "timestamp": "2026-02-14T00:31:47Z",
          "url": "https://github.com/albertobadia/zoocache/pull/7/commits/2364a7f0480ceb2c3b582beb91223aa802a55686"
        },
        "date": 1771049795943,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 425840.06516601605,
            "unit": "iter/sec",
            "range": "stddev: 5.047279697482591e-7",
            "extra": "mean: 2.3482994715636836 usec\nrounds: 12876"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.76710006102594,
            "unit": "iter/sec",
            "range": "stddev: 0.00011008777219674107",
            "extra": "mean: 102.38453519999666 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 83181.52706903558,
            "unit": "iter/sec",
            "range": "stddev: 0.000008590647716764746",
            "extra": "mean: 12.021899996739194 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 166.8788212259954,
            "unit": "iter/sec",
            "range": "stddev: 0.000058875635345089685",
            "extra": "mean: 5.992372145568738 msec\nrounds: 158"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 180.23858270781048,
            "unit": "iter/sec",
            "range": "stddev: 0.00005113576653206656",
            "extra": "mean: 5.548201639052646 msec\nrounds: 169"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 179.0350225896295,
            "unit": "iter/sec",
            "range": "stddev: 0.000049254268142161354",
            "extra": "mean: 5.585499337144353 msec\nrounds: 175"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1017.9478680376194,
            "unit": "iter/sec",
            "range": "stddev: 0.00005634489301073803",
            "extra": "mean: 982.3685783907391 usec\nrounds: 944"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 144.29626100238156,
            "unit": "iter/sec",
            "range": "stddev: 0.00010031515037725004",
            "extra": "mean: 6.930186500005675 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6244.635319836413,
            "unit": "iter/sec",
            "range": "stddev: 0.000009925740103764262",
            "extra": "mean: 160.13745379549184 usec\nrounds: 4242"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5178.190500306035,
            "unit": "iter/sec",
            "range": "stddev: 0.000013628466113001826",
            "extra": "mean: 193.11765373268895 usec\nrounds: 4072"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 171.79603455666418,
            "unit": "iter/sec",
            "range": "stddev: 0.0003600227208873887",
            "extra": "mean: 5.820856125000755 msec\nrounds: 48"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 111.63429391212665,
            "unit": "iter/sec",
            "range": "stddev: 0.0005935670569283854",
            "extra": "mean: 8.95782080000572 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 463780.0262271589,
            "unit": "iter/sec",
            "range": "stddev: 4.591488968483724e-7",
            "extra": "mean: 2.15619462557493 usec\nrounds: 108850"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 462756.54854948306,
            "unit": "iter/sec",
            "range": "stddev: 4.804946380358321e-7",
            "extra": "mean: 2.1609634766585457 usec\nrounds: 172712"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 449417.27106536465,
            "unit": "iter/sec",
            "range": "stddev: 9.005320828745742e-7",
            "extra": "mean: 2.2251036272581453 usec\nrounds: 162023"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 459862.6086173851,
            "unit": "iter/sec",
            "range": "stddev: 4.685903339819958e-7",
            "extra": "mean: 2.1745625351158306 usec\nrounds: 163908"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 443620.99951624445,
            "unit": "iter/sec",
            "range": "stddev: 6.087266975099505e-7",
            "extra": "mean: 2.2541764278302208 usec\nrounds: 145731"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 462602.7496465201,
            "unit": "iter/sec",
            "range": "stddev: 4.3963785016448365e-7",
            "extra": "mean: 2.1616819198850656 usec\nrounds: 135796"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 50.04660590175209,
            "unit": "iter/sec",
            "range": "stddev: 0.004080043412274038",
            "extra": "mean: 19.98137499999757 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 55.661945323938056,
            "unit": "iter/sec",
            "range": "stddev: 0.001836491829306188",
            "extra": "mean: 17.965595600014694 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 34.44648457192621,
            "unit": "iter/sec",
            "range": "stddev: 0.010989624449262853",
            "extra": "mean: 29.03053860001137 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 471872.25901494134,
            "unit": "iter/sec",
            "range": "stddev: 4.649243017820421e-7",
            "extra": "mean: 2.1192176079338796 usec\nrounds: 174217"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 987908.0060952246,
            "unit": "iter/sec",
            "range": "stddev: 2.9269293232977825e-7",
            "extra": "mean: 1.0122399999090703 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 196419.6625433808,
            "unit": "iter/sec",
            "range": "stddev: 0.000002021984833973677",
            "extra": "mean: 5.091139996125094 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4653.197965647861,
            "unit": "iter/sec",
            "range": "stddev: 0.00002558542382514763",
            "extra": "mean: 214.90596518404752 usec\nrounds: 4452"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4569.052824542264,
            "unit": "iter/sec",
            "range": "stddev: 0.000022105927595405332",
            "extra": "mean: 218.86374231188321 usec\nrounds: 4195"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 2996.7357807800918,
            "unit": "iter/sec",
            "range": "stddev: 0.000008753207920603034",
            "extra": "mean: 333.6964194219639 usec\nrounds: 2873"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2877.7979085260304,
            "unit": "iter/sec",
            "range": "stddev: 0.000009549565065553593",
            "extra": "mean: 347.4879167287277 usec\nrounds: 2702"
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
          "id": "34a3793a85e6aa1adc62e8f1ed25ee4de44019e8",
          "message": "NEXT RELEASE",
          "timestamp": "2026-02-14T00:31:47Z",
          "url": "https://github.com/albertobadia/zoocache/pull/7/commits/34a3793a85e6aa1adc62e8f1ed25ee4de44019e8"
        },
        "date": 1771050188749,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 434961.8504299197,
            "unit": "iter/sec",
            "range": "stddev: 4.723137508567994e-7",
            "extra": "mean: 2.2990522019611426 usec\nrounds: 13352"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.775949682138755,
            "unit": "iter/sec",
            "range": "stddev: 0.00022854601461342198",
            "extra": "mean: 102.29185220000261 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 79176.62643238613,
            "unit": "iter/sec",
            "range": "stddev: 0.000006084857304155193",
            "extra": "mean: 12.629989999055624 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 167.2047529848704,
            "unit": "iter/sec",
            "range": "stddev: 0.000054544495912692196",
            "extra": "mean: 5.980691231250379 msec\nrounds: 160"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 179.3737649727119,
            "unit": "iter/sec",
            "range": "stddev: 0.00005505822592412703",
            "extra": "mean: 5.574951276470837 msec\nrounds: 170"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 179.69364970230114,
            "unit": "iter/sec",
            "range": "stddev: 0.000051896582372360276",
            "extra": "mean: 5.5650269314285845 msec\nrounds: 175"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1058.8393752871063,
            "unit": "iter/sec",
            "range": "stddev: 0.000012403915563053486",
            "extra": "mean: 944.4303105264178 usec\nrounds: 950"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 145.15954325722154,
            "unit": "iter/sec",
            "range": "stddev: 0.00012996522990416383",
            "extra": "mean: 6.8889718000008315 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6321.471106490089,
            "unit": "iter/sec",
            "range": "stddev: 0.000008544491647528212",
            "extra": "mean: 158.19102597389494 usec\nrounds: 4928"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5235.82549664112,
            "unit": "iter/sec",
            "range": "stddev: 0.000009568708174168255",
            "extra": "mean: 190.9918504047774 usec\nrounds: 4198"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 174.09646987892282,
            "unit": "iter/sec",
            "range": "stddev: 0.00036766112838703725",
            "extra": "mean: 5.743941854165453 msec\nrounds: 48"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 114.1814943763949,
            "unit": "iter/sec",
            "range": "stddev: 0.0002666232957423287",
            "extra": "mean: 8.757986619999372 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 457073.1082101175,
            "unit": "iter/sec",
            "range": "stddev: 4.612190813188077e-7",
            "extra": "mean: 2.1878338104728265 usec\nrounds: 131338"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 453575.6220938313,
            "unit": "iter/sec",
            "range": "stddev: 4.404038573790931e-7",
            "extra": "mean: 2.2047040257228145 usec\nrounds: 170329"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 440699.11128363456,
            "unit": "iter/sec",
            "range": "stddev: 0.0000010196059383441074",
            "extra": "mean: 2.269121889280141 usec\nrounds: 161499"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 441440.99662841135,
            "unit": "iter/sec",
            "range": "stddev: 8.724842809280942e-7",
            "extra": "mean: 2.2653084050590864 usec\nrounds: 157679"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 439224.4331213912,
            "unit": "iter/sec",
            "range": "stddev: 5.411750342223064e-7",
            "extra": "mean: 2.276740373693245 usec\nrounds: 152161"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 454614.7377436584,
            "unit": "iter/sec",
            "range": "stddev: 4.249764273218866e-7",
            "extra": "mean: 2.199664720425024 usec\nrounds: 138046"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 49.18332950326443,
            "unit": "iter/sec",
            "range": "stddev: 0.0025318752022916967",
            "extra": "mean: 20.332092399999624 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 47.55426014791389,
            "unit": "iter/sec",
            "range": "stddev: 0.0005759202679900138",
            "extra": "mean: 21.028610200002618 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 32.06990747235002,
            "unit": "iter/sec",
            "range": "stddev: 0.009864481602969495",
            "extra": "mean: 31.181879800001866 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 466549.3966674275,
            "unit": "iter/sec",
            "range": "stddev: 4.7518365839191413e-7",
            "extra": "mean: 2.143395762898895 usec\nrounds: 168606"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 1009000.2828036371,
            "unit": "iter/sec",
            "range": "stddev: 4.134645373448001e-7",
            "extra": "mean: 991.079999721478 nsec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 195783.60428224684,
            "unit": "iter/sec",
            "range": "stddev: 0.000001883991185036955",
            "extra": "mean: 5.107680000406845 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4726.167757383594,
            "unit": "iter/sec",
            "range": "stddev: 0.0000065894592829043615",
            "extra": "mean: 211.58791886676488 usec\nrounds: 4659"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4637.570120564073,
            "unit": "iter/sec",
            "range": "stddev: 0.000009427231988945943",
            "extra": "mean: 215.630162779807 usec\nrounds: 4245"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 3021.183127246735,
            "unit": "iter/sec",
            "range": "stddev: 0.000017097235030974723",
            "extra": "mean: 330.99615544037556 usec\nrounds: 2702"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2904.564344026826,
            "unit": "iter/sec",
            "range": "stddev: 0.000012057172328626048",
            "extra": "mean: 344.2857108868938 usec\nrounds: 2774"
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
          "id": "c7db104acf853e165a5341634218c5f7f153fc78",
          "message": "Merge pull request #7 from albertobadia/dev\n\nNEXT RELEASE",
          "timestamp": "2026-02-14T03:24:39-03:00",
          "tree_id": "976e9053426e908ce1013ee0201bc0abd06d4802",
          "url": "https://github.com/albertobadia/zoocache/commit/c7db104acf853e165a5341634218c5f7f153fc78"
        },
        "date": 1771050434865,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 446081.4343877446,
            "unit": "iter/sec",
            "range": "stddev: 4.501229261641287e-7",
            "extra": "mean: 2.2417431502669896 usec\nrounds: 16570"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.780470302130546,
            "unit": "iter/sec",
            "range": "stddev: 0.0001177939415297972",
            "extra": "mean: 102.24457199999506 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 55312.57968512336,
            "unit": "iter/sec",
            "range": "stddev: 0.000006122749641112523",
            "extra": "mean: 18.079069999856756 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 167.02814375794065,
            "unit": "iter/sec",
            "range": "stddev: 0.00003894226605517815",
            "extra": "mean: 5.987014987421598 msec\nrounds: 159"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 179.27971621541354,
            "unit": "iter/sec",
            "range": "stddev: 0.000056896861810193256",
            "extra": "mean: 5.5778758529406085 msec\nrounds: 170"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 179.9745897842397,
            "unit": "iter/sec",
            "range": "stddev: 0.000051907430326964305",
            "extra": "mean: 5.55633993220286 msec\nrounds: 177"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1061.4599033524632,
            "unit": "iter/sec",
            "range": "stddev: 0.000014770876975688",
            "extra": "mean: 942.0987046629351 usec\nrounds: 965"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 145.22474393212948,
            "unit": "iter/sec",
            "range": "stddev: 0.0001156538082375157",
            "extra": "mean: 6.885878899998943 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6323.940646295816,
            "unit": "iter/sec",
            "range": "stddev: 0.000009520383779032115",
            "extra": "mean: 158.1292513530689 usec\nrounds: 4989"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5148.701701794132,
            "unit": "iter/sec",
            "range": "stddev: 0.000010936715477673718",
            "extra": "mean: 194.2237204481155 usec\nrounds: 4196"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 174.52135320259475,
            "unit": "iter/sec",
            "range": "stddev: 0.00023225218418549396",
            "extra": "mean: 5.7299578627443974 msec\nrounds: 51"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 110.74571595758962,
            "unit": "iter/sec",
            "range": "stddev: 0.0003050293155144387",
            "extra": "mean: 9.029694659998881 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 460879.8136852581,
            "unit": "iter/sec",
            "range": "stddev: 4.895292568926272e-7",
            "extra": "mean: 2.1697630712090925 usec\nrounds: 124147"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 462706.17029927304,
            "unit": "iter/sec",
            "range": "stddev: 4.592988462592336e-7",
            "extra": "mean: 2.16119875676871 usec\nrounds: 176960"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 449683.2827207464,
            "unit": "iter/sec",
            "range": "stddev: 7.694129075261847e-7",
            "extra": "mean: 2.223787359738255 usec\nrounds: 152370"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 461548.7847966766,
            "unit": "iter/sec",
            "range": "stddev: 4.70691234481389e-7",
            "extra": "mean: 2.166618205788418 usec\nrounds: 148766"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 443858.3745953102,
            "unit": "iter/sec",
            "range": "stddev: 6.042386316306296e-7",
            "extra": "mean: 2.2529708962047956 usec\nrounds: 142593"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 466922.58680027234,
            "unit": "iter/sec",
            "range": "stddev: 5.013374310780953e-7",
            "extra": "mean: 2.141682643482298 usec\nrounds: 140391"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 47.51641216876447,
            "unit": "iter/sec",
            "range": "stddev: 0.0032708893982054217",
            "extra": "mean: 21.04535999999939 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 46.02311586472671,
            "unit": "iter/sec",
            "range": "stddev: 0.0010968931640340479",
            "extra": "mean: 21.72821159999785 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 31.36578581816658,
            "unit": "iter/sec",
            "range": "stddev: 0.010047487891438917",
            "extra": "mean: 31.88187300000038 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 453507.45601267455,
            "unit": "iter/sec",
            "range": "stddev: 4.797170373253431e-7",
            "extra": "mean: 2.205035411748671 usec\nrounds: 172118"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 1052055.7179049891,
            "unit": "iter/sec",
            "range": "stddev: 3.043972841946538e-7",
            "extra": "mean: 950.519999065591 nsec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 208952.35465962684,
            "unit": "iter/sec",
            "range": "stddev: 0.0000011425931838289107",
            "extra": "mean: 4.78578000056018 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4752.235222987994,
            "unit": "iter/sec",
            "range": "stddev: 0.00000808178088905621",
            "extra": "mean: 210.4272943314545 usec\nrounds: 4675"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4659.331210062305,
            "unit": "iter/sec",
            "range": "stddev: 0.000006731170258646132",
            "extra": "mean: 214.62307677127507 usec\nrounds: 4559"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 2986.31778964766,
            "unit": "iter/sec",
            "range": "stddev: 0.000008011856472027987",
            "extra": "mean: 334.8605441345158 usec\nrounds: 2617"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2869.191727892424,
            "unit": "iter/sec",
            "range": "stddev: 0.000025655465878639212",
            "extra": "mean: 348.5302115849031 usec\nrounds: 2486"
          }
        ]
      }
    ]
  }
}