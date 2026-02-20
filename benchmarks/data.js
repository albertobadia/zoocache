window.BENCHMARK_DATA = {
  "lastUpdate": 1771603888857,
  "repoUrl": "https://github.com/albertobadia/zoocache",
  "entries": {
    "Python Benchmark": [
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
          "id": "18a484c39027965f40315cddb41a9a96a67bc8c9",
          "message": "FIX: Bench GH page not working on dev",
          "timestamp": "2026-02-20T01:31:21-03:00",
          "tree_id": "624ea96ee089d708a0e1220aa5bf370ddc349283",
          "url": "https://github.com/albertobadia/zoocache/commit/18a484c39027965f40315cddb41a9a96a67bc8c9"
        },
        "date": 1771562037026,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 434538.38518701366,
            "unit": "iter/sec",
            "range": "stddev: 4.531814746703362e-7",
            "extra": "mean: 2.3012926684707655 usec\nrounds: 11853"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.787590800654684,
            "unit": "iter/sec",
            "range": "stddev: 0.00011294510150491192",
            "extra": "mean: 102.17018879999671 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 85365.89530100899,
            "unit": "iter/sec",
            "range": "stddev: 0.000006216388534062108",
            "extra": "mean: 11.714279999921473 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 166.48806901857049,
            "unit": "iter/sec",
            "range": "stddev: 0.00008089197108140812",
            "extra": "mean: 6.006436412500271 msec\nrounds: 160"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 179.66829870313458,
            "unit": "iter/sec",
            "range": "stddev: 0.00004427836172797737",
            "extra": "mean: 5.565812150602579 msec\nrounds: 166"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 180.05183555260757,
            "unit": "iter/sec",
            "range": "stddev: 0.00004629335526074245",
            "extra": "mean: 5.553956153409054 msec\nrounds: 176"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1036.2877159198295,
            "unit": "iter/sec",
            "range": "stddev: 0.00007194458796008707",
            "extra": "mean: 964.9829720430297 usec\nrounds: 930"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 145.88814837367948,
            "unit": "iter/sec",
            "range": "stddev: 0.00010629122000848395",
            "extra": "mean: 6.8545663999969975 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6205.102514602684,
            "unit": "iter/sec",
            "range": "stddev: 0.00001884981787245233",
            "extra": "mean: 161.1576920198603 usec\nrounds: 4812"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5204.340368412982,
            "unit": "iter/sec",
            "range": "stddev: 0.000010910781750848721",
            "extra": "mean: 192.14730959361546 usec\nrounds: 4086"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 82.98879413974659,
            "unit": "iter/sec",
            "range": "stddev: 0.000524224409891084",
            "extra": "mean: 12.049819621623598 msec\nrounds: 37"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 84.46551458103382,
            "unit": "iter/sec",
            "range": "stddev: 0.0006855986775228594",
            "extra": "mean: 11.839151220000304 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 465211.314682898,
            "unit": "iter/sec",
            "range": "stddev: 4.3388268857032166e-7",
            "extra": "mean: 2.1495607876210623 usec\nrounds: 97561"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 455261.9629861801,
            "unit": "iter/sec",
            "range": "stddev: 4.363037888938769e-7",
            "extra": "mean: 2.1965375570599908 usec\nrounds: 171792"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 439956.0091544274,
            "unit": "iter/sec",
            "range": "stddev: 0.000001094814552791466",
            "extra": "mean: 2.272954520889368 usec\nrounds: 164691"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 446082.8856510556,
            "unit": "iter/sec",
            "range": "stddev: 7.856826826395867e-7",
            "extra": "mean: 2.2417358570941484 usec\nrounds: 145709"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 454546.80764608807,
            "unit": "iter/sec",
            "range": "stddev: 4.375377017145012e-7",
            "extra": "mean: 2.1999934510124293 usec\nrounds: 150558"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 457310.613047865,
            "unit": "iter/sec",
            "range": "stddev: 4.04347548385344e-7",
            "extra": "mean: 2.1866975562522835 usec\nrounds: 144655"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 55.70523428217559,
            "unit": "iter/sec",
            "range": "stddev: 0.002451196521880946",
            "extra": "mean: 17.95163440000067 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 54.760738723242305,
            "unit": "iter/sec",
            "range": "stddev: 0.0010220172065463903",
            "extra": "mean: 18.261258399999747 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 34.9722468292776,
            "unit": "iter/sec",
            "range": "stddev: 0.009996967159093225",
            "extra": "mean: 28.594102200000293 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 464113.3629820798,
            "unit": "iter/sec",
            "range": "stddev: 4.788287351538235e-7",
            "extra": "mean: 2.154645997638753 usec\nrounds: 164691"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 1057619.0878276723,
            "unit": "iter/sec",
            "range": "stddev: 3.558710321308552e-7",
            "extra": "mean: 945.5200000729747 nsec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 207109.23147069683,
            "unit": "iter/sec",
            "range": "stddev: 0.0000011808954027254454",
            "extra": "mean: 4.828370000211635 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4691.925504794396,
            "unit": "iter/sec",
            "range": "stddev: 0.000011753281048696095",
            "extra": "mean: 213.13211366594805 usec\nrounds: 4610"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4558.46922595057,
            "unit": "iter/sec",
            "range": "stddev: 0.000006909206607592801",
            "extra": "mean: 219.3718878932372 usec\nrounds: 4353"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 2947.1704222416224,
            "unit": "iter/sec",
            "range": "stddev: 0.000018852210724112742",
            "extra": "mean: 339.30850840970317 usec\nrounds: 2616"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2804.3050223001997,
            "unit": "iter/sec",
            "range": "stddev: 0.000011091805236485495",
            "extra": "mean: 356.59459012050024 usec\nrounds: 2652"
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
          "id": "995f2d15c51ed8291ae79b119b248f1c08b982d7",
          "message": "UPDATE: Release",
          "timestamp": "2026-02-20T01:39:39-03:00",
          "tree_id": "dcecac186dd2c6612529e674c7f951c539f14577",
          "url": "https://github.com/albertobadia/zoocache/commit/995f2d15c51ed8291ae79b119b248f1c08b982d7"
        },
        "date": 1771562547562,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 436482.8701231184,
            "unit": "iter/sec",
            "range": "stddev: 3.723212434100086e-7",
            "extra": "mean: 2.2910406534806986 usec\nrounds: 13283"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.81589960296325,
            "unit": "iter/sec",
            "range": "stddev: 0.00011389982624502866",
            "extra": "mean: 101.87553259999902 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 87349.13712226375,
            "unit": "iter/sec",
            "range": "stddev: 0.0000067619228882475145",
            "extra": "mean: 11.448309999906314 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 172.62907145240843,
            "unit": "iter/sec",
            "range": "stddev: 0.000057613550415662754",
            "extra": "mean: 5.792767067484847 msec\nrounds: 163"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 185.40363559984647,
            "unit": "iter/sec",
            "range": "stddev: 0.00003347337394876409",
            "extra": "mean: 5.393637491328828 msec\nrounds: 173"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 184.90332399825414,
            "unit": "iter/sec",
            "range": "stddev: 0.000043185594305067636",
            "extra": "mean: 5.408231601122769 msec\nrounds: 178"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1199.5207410428825,
            "unit": "iter/sec",
            "range": "stddev: 0.000012807012087952824",
            "extra": "mean: 833.6662850286224 usec\nrounds: 1042"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 151.32289577601443,
            "unit": "iter/sec",
            "range": "stddev: 0.00008700866071660212",
            "extra": "mean: 6.60838530000234 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 7849.707407863448,
            "unit": "iter/sec",
            "range": "stddev: 0.000005251445209190086",
            "extra": "mean: 127.39328334687347 usec\nrounds: 4948"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 6458.750652907769,
            "unit": "iter/sec",
            "range": "stddev: 0.0000054448789266210574",
            "extra": "mean: 154.82870507623542 usec\nrounds: 4452"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 73.45747073755564,
            "unit": "iter/sec",
            "range": "stddev: 0.0005401000763388585",
            "extra": "mean: 13.613319243902895 msec\nrounds: 41"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 74.4847854986124,
            "unit": "iter/sec",
            "range": "stddev: 0.0016910499059551755",
            "extra": "mean: 13.42556058000099 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 456259.73453048745,
            "unit": "iter/sec",
            "range": "stddev: 2.895804381484733e-7",
            "extra": "mean: 2.191734059173656 usec\nrounds: 90099"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 448062.63570419,
            "unit": "iter/sec",
            "range": "stddev: 3.2762617308779477e-7",
            "extra": "mean: 2.2318308207698845 usec\nrounds: 196348"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 432889.12366004346,
            "unit": "iter/sec",
            "range": "stddev: 0.000001085737772122833",
            "extra": "mean: 2.3100603488142153 usec\nrounds: 177054"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 432786.2340698475,
            "unit": "iter/sec",
            "range": "stddev: 6.545144775168824e-7",
            "extra": "mean: 2.310609537175366 usec\nrounds: 137798"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 444323.3649012583,
            "unit": "iter/sec",
            "range": "stddev: 2.93138951176559e-7",
            "extra": "mean: 2.250613132222361 usec\nrounds: 110583"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 436886.17372799147,
            "unit": "iter/sec",
            "range": "stddev: 3.4920379400377287e-7",
            "extra": "mean: 2.288925720553032 usec\nrounds: 112171"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 60.452212290421606,
            "unit": "iter/sec",
            "range": "stddev: 0.003406145543284516",
            "extra": "mean: 16.541991799999778 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 65.3100148192308,
            "unit": "iter/sec",
            "range": "stddev: 0.0010892398470421123",
            "extra": "mean: 15.311587400000803 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 41.02474125839269,
            "unit": "iter/sec",
            "range": "stddev: 0.01053466802513448",
            "extra": "mean: 24.375534600000037 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 454478.5427146716,
            "unit": "iter/sec",
            "range": "stddev: 3.261925868217071e-7",
            "extra": "mean: 2.2003239009411604 usec\nrounds: 190549"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 1002305.3028525559,
            "unit": "iter/sec",
            "range": "stddev: 3.913159237519097e-7",
            "extra": "mean: 997.6999993455137 nsec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 199529.11126883325,
            "unit": "iter/sec",
            "range": "stddev: 0.0000013663258120920348",
            "extra": "mean: 5.0118000007159935 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4635.425088855748,
            "unit": "iter/sec",
            "range": "stddev: 0.000015848048368296542",
            "extra": "mean: 215.72994511423533 usec\nrounds: 4646"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4635.397686778802,
            "unit": "iter/sec",
            "range": "stddev: 0.000005896420933859397",
            "extra": "mean: 215.73122039824656 usec\nrounds: 4569"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 3036.852906025915,
            "unit": "iter/sec",
            "range": "stddev: 0.000010727328672801319",
            "extra": "mean: 329.2882569372184 usec\nrounds: 2919"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2864.323805478975,
            "unit": "iter/sec",
            "range": "stddev: 0.0000065838812399015505",
            "extra": "mean: 349.1225391791132 usec\nrounds: 2680"
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
          "id": "7ad5e3508e702511be7d48bba6107862d3cc918a",
          "message": "ADD: TTI saturation telemetry report",
          "timestamp": "2026-02-20T13:08:37-03:00",
          "tree_id": "fcdba134acb511e980d0491698f94359ef340da2",
          "url": "https://github.com/albertobadia/zoocache/commit/7ad5e3508e702511be7d48bba6107862d3cc918a"
        },
        "date": 1771603888420,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 383789.8272237028,
            "unit": "iter/sec",
            "range": "stddev: 4.792774114114381e-7",
            "extra": "mean: 2.605592772570081 usec\nrounds: 9879"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.75315214708838,
            "unit": "iter/sec",
            "range": "stddev: 0.00014136512221299725",
            "extra": "mean: 102.53095459999884 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 101952.70007087465,
            "unit": "iter/sec",
            "range": "stddev: 0.000008912474826314125",
            "extra": "mean: 9.808469999370573 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 165.80998475691374,
            "unit": "iter/sec",
            "range": "stddev: 0.0000755299990483256",
            "extra": "mean: 6.030999891026185 msec\nrounds: 156"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 179.59681278814008,
            "unit": "iter/sec",
            "range": "stddev: 0.00005433306439888225",
            "extra": "mean: 5.568027541667133 msec\nrounds: 168"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 176.86178800158203,
            "unit": "iter/sec",
            "range": "stddev: 0.0003194131058549135",
            "extra": "mean: 5.654132593022609 msec\nrounds: 172"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1048.2901306237934,
            "unit": "iter/sec",
            "range": "stddev: 0.00003928685782212092",
            "extra": "mean: 953.9343839905675 usec\nrounds: 862"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 143.67553306109244,
            "unit": "iter/sec",
            "range": "stddev: 0.00006141892364330314",
            "extra": "mean: 6.960127299996088 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6376.742132182386,
            "unit": "iter/sec",
            "range": "stddev: 0.00000997841895095006",
            "extra": "mean: 156.81989004277935 usec\nrounds: 4911"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5265.961396868591,
            "unit": "iter/sec",
            "range": "stddev: 0.00001101142253720457",
            "extra": "mean: 189.898847453506 usec\nrounds: 4202"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 76.94068779160524,
            "unit": "iter/sec",
            "range": "stddev: 0.0008189479488940234",
            "extra": "mean: 12.997024444446245 msec\nrounds: 36"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 78.15614094800718,
            "unit": "iter/sec",
            "range": "stddev: 0.0008071714356883251",
            "extra": "mean: 12.79489989999945 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 410449.34275421174,
            "unit": "iter/sec",
            "range": "stddev: 4.822430474327975e-7",
            "extra": "mean: 2.4363542484677025 usec\nrounds: 76133"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 400904.7313712122,
            "unit": "iter/sec",
            "range": "stddev: 6.125697636536812e-7",
            "extra": "mean: 2.4943581897367624 usec\nrounds: 157679"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 401492.6108064938,
            "unit": "iter/sec",
            "range": "stddev: 5.158501339897457e-7",
            "extra": "mean: 2.490705863779812 usec\nrounds: 148965"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 401825.3505664171,
            "unit": "iter/sec",
            "range": "stddev: 4.692551235325912e-7",
            "extra": "mean: 2.488643383475905 usec\nrounds: 126343"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 401059.37648913055,
            "unit": "iter/sec",
            "range": "stddev: 4.804918667456645e-7",
            "extra": "mean: 2.4933963862258732 usec\nrounds: 131165"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 385972.43558247306,
            "unit": "iter/sec",
            "range": "stddev: 6.767466038541259e-7",
            "extra": "mean: 2.5908585893987346 usec\nrounds: 114065"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 54.73215887607286,
            "unit": "iter/sec",
            "range": "stddev: 0.003179199018076481",
            "extra": "mean: 18.270794000000024 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 42.34727704382797,
            "unit": "iter/sec",
            "range": "stddev: 0.01286274234280948",
            "extra": "mean: 23.61426920000156 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 38.41221392858839,
            "unit": "iter/sec",
            "range": "stddev: 0.0005651821022595084",
            "extra": "mean: 26.03338620000102 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 409918.9463191232,
            "unit": "iter/sec",
            "range": "stddev: 5.15372234855831e-7",
            "extra": "mean: 2.439506660961938 usec\nrounds: 155232"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 696364.2820243296,
            "unit": "iter/sec",
            "range": "stddev: 4.4927947831471887e-7",
            "extra": "mean: 1.436030000121491 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 193124.0126200027,
            "unit": "iter/sec",
            "range": "stddev: 0.0000013335053903289544",
            "extra": "mean: 5.178020000897732 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4188.919846712809,
            "unit": "iter/sec",
            "range": "stddev: 0.000009009279886079031",
            "extra": "mean: 238.72502616270748 usec\nrounds: 3440"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4107.48620634694,
            "unit": "iter/sec",
            "range": "stddev: 0.000009354031092750394",
            "extra": "mean: 243.45790825901918 usec\nrounds: 4044"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 2741.4333148758687,
            "unit": "iter/sec",
            "range": "stddev: 0.000008231759221639441",
            "extra": "mean: 364.7726882772196 usec\nrounds: 2653"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2625.3424359947303,
            "unit": "iter/sec",
            "range": "stddev: 0.000018807734869735405",
            "extra": "mean: 380.90269150778596 usec\nrounds: 2308"
          }
        ]
      }
    ]
  }
}