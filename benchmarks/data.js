window.BENCHMARK_DATA = {
  "lastUpdate": 1772085802071,
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
          "id": "af432ca9e32caf8d03c95b142a836a52eedf08b9",
          "message": "FIX: Exceptions handling performance regression",
          "timestamp": "2026-02-20T13:22:27-03:00",
          "tree_id": "4ea740b53457299ec22413fc6ed4a725822257d3",
          "url": "https://github.com/albertobadia/zoocache/commit/af432ca9e32caf8d03c95b142a836a52eedf08b9"
        },
        "date": 1771604702087,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 388238.31169725035,
            "unit": "iter/sec",
            "range": "stddev: 4.800570083010586e-7",
            "extra": "mean: 2.575737555699561 usec\nrounds: 10467"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.789965301231156,
            "unit": "iter/sec",
            "range": "stddev: 0.00004759071049297878",
            "extra": "mean: 102.14540799998986 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 74775.13251207313,
            "unit": "iter/sec",
            "range": "stddev: 0.000009000976812175502",
            "extra": "mean: 13.373429994771868 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 166.4683314412883,
            "unit": "iter/sec",
            "range": "stddev: 0.00004977696741255646",
            "extra": "mean: 6.007148574999022 msec\nrounds: 160"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 179.33453559904189,
            "unit": "iter/sec",
            "range": "stddev: 0.00005421643953265566",
            "extra": "mean: 5.576170795321939 msec\nrounds: 171"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 180.10290378140965,
            "unit": "iter/sec",
            "range": "stddev: 0.00003976121985802318",
            "extra": "mean: 5.5523813275864615 msec\nrounds: 174"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1024.4280257276757,
            "unit": "iter/sec",
            "range": "stddev: 0.00007483622824591995",
            "extra": "mean: 976.1544734093701 usec\nrounds: 959"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 145.7092558308688,
            "unit": "iter/sec",
            "range": "stddev: 0.00010061579022752903",
            "extra": "mean: 6.862981999995554 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6324.204696183252,
            "unit": "iter/sec",
            "range": "stddev: 0.000008511933338766862",
            "extra": "mean: 158.12264909823588 usec\nrounds: 4383"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5201.066653280688,
            "unit": "iter/sec",
            "range": "stddev: 0.000019869647637725467",
            "extra": "mean: 192.2682531609603 usec\nrounds: 3954"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 89.41423594003761,
            "unit": "iter/sec",
            "range": "stddev: 0.0007018819743429457",
            "extra": "mean: 11.183901416667178 msec\nrounds: 36"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 86.45779154738078,
            "unit": "iter/sec",
            "range": "stddev: 0.0012967253292963138",
            "extra": "mean: 11.566337540000404 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 404720.89981935604,
            "unit": "iter/sec",
            "range": "stddev: 5.049777332561483e-7",
            "extra": "mean: 2.4708385468759877 usec\nrounds: 88168"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 402545.05323442846,
            "unit": "iter/sec",
            "range": "stddev: 4.7226395403318333e-7",
            "extra": "mean: 2.4841939851578156 usec\nrounds: 141583"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 385415.84577609436,
            "unit": "iter/sec",
            "range": "stddev: 9.249917728840142e-7",
            "extra": "mean: 2.5946001207769376 usec\nrounds: 148965"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 400581.93457522785,
            "unit": "iter/sec",
            "range": "stddev: 5.04680349391504e-7",
            "extra": "mean: 2.496368192590581 usec\nrounds: 131510"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 381960.8652618752,
            "unit": "iter/sec",
            "range": "stddev: 7.748986800338799e-7",
            "extra": "mean: 2.618069260353132 usec\nrounds: 128140"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 406603.15956584463,
            "unit": "iter/sec",
            "range": "stddev: 4.92484475447533e-7",
            "extra": "mean: 2.4594004657213238 usec\nrounds: 123686"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 54.887414112832765,
            "unit": "iter/sec",
            "range": "stddev: 0.0022956664258802664",
            "extra": "mean: 18.2191130000092 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 43.51770721146418,
            "unit": "iter/sec",
            "range": "stddev: 0.00922873714439653",
            "extra": "mean: 22.979151799995634 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 42.028245115754316,
            "unit": "iter/sec",
            "range": "stddev: 0.0009978309454775735",
            "extra": "mean: 23.79352259999905 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 410330.6771515052,
            "unit": "iter/sec",
            "range": "stddev: 5.988566492057508e-7",
            "extra": "mean: 2.4370588300683473 usec\nrounds: 27588"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 686280.5652447654,
            "unit": "iter/sec",
            "range": "stddev: 3.3728529184665384e-7",
            "extra": "mean: 1.4571299999488474 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 189330.4707051429,
            "unit": "iter/sec",
            "range": "stddev: 9.95809266864538e-7",
            "extra": "mean: 5.2817699986462685 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4167.2162566457655,
            "unit": "iter/sec",
            "range": "stddev: 0.000008190372483028065",
            "extra": "mean: 239.9683477921806 usec\nrounds: 3873"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4124.238506246741,
            "unit": "iter/sec",
            "range": "stddev: 0.000006708657080796082",
            "extra": "mean: 242.46900330457584 usec\nrounds: 3632"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 2737.406402289918,
            "unit": "iter/sec",
            "range": "stddev: 0.000008052551873247596",
            "extra": "mean: 365.3092939226969 usec\nrounds: 2419"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2640.027281421843,
            "unit": "iter/sec",
            "range": "stddev: 0.00001224099695275484",
            "extra": "mean: 378.7839644829082 usec\nrounds: 2534"
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
          "id": "3ba74a2543c9cfcab99e5b65bb725e8f9bdf7e09",
          "message": "FIX: telemetry invalidate performance regression",
          "timestamp": "2026-02-20T13:49:48-03:00",
          "tree_id": "b3b7aff60e682beff5f4558e96e596ba847b3d9f",
          "url": "https://github.com/albertobadia/zoocache/commit/3ba74a2543c9cfcab99e5b65bb725e8f9bdf7e09"
        },
        "date": 1771606349316,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 395886.3303163339,
            "unit": "iter/sec",
            "range": "stddev: 4.259092683020308e-7",
            "extra": "mean: 2.525977593621249 usec\nrounds: 11827"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.79099852566371,
            "unit": "iter/sec",
            "range": "stddev: 0.00016498321263087238",
            "extra": "mean: 102.13462879999895 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 118487.90475894167,
            "unit": "iter/sec",
            "range": "stddev: 0.000006858286856867723",
            "extra": "mean: 8.439679999696637 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 166.41711630125087,
            "unit": "iter/sec",
            "range": "stddev: 0.00003504843986752955",
            "extra": "mean: 6.00899728480924 msec\nrounds: 158"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 180.3861210973641,
            "unit": "iter/sec",
            "range": "stddev: 0.0000412950371770396",
            "extra": "mean: 5.543663747058711 msec\nrounds: 170"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 179.93185874184059,
            "unit": "iter/sec",
            "range": "stddev: 0.000047416684859786044",
            "extra": "mean: 5.55765947727335 msec\nrounds: 176"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1048.5951386710294,
            "unit": "iter/sec",
            "range": "stddev: 0.00009556331198930937",
            "extra": "mean: 953.6569102040488 usec\nrounds: 980"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 146.37401485349713,
            "unit": "iter/sec",
            "range": "stddev: 0.00011050860145247821",
            "extra": "mean: 6.831813699999145 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6299.881880940327,
            "unit": "iter/sec",
            "range": "stddev: 0.000008229137415262031",
            "extra": "mean: 158.73313482676582 usec\nrounds: 4821"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5191.41882870332,
            "unit": "iter/sec",
            "range": "stddev: 0.00000976817540473282",
            "extra": "mean: 192.62556788348624 usec\nrounds: 4191"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 86.0638228655113,
            "unit": "iter/sec",
            "range": "stddev: 0.0013921891313686606",
            "extra": "mean: 11.619283999999192 msec\nrounds: 37"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 85.2676734229952,
            "unit": "iter/sec",
            "range": "stddev: 0.0004799254670892273",
            "extra": "mean: 11.72777396000015 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 408266.18742604606,
            "unit": "iter/sec",
            "range": "stddev: 5.381220905980243e-7",
            "extra": "mean: 2.4493823657173213 usec\nrounds: 87398"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 402109.95129338175,
            "unit": "iter/sec",
            "range": "stddev: 5.181174878671478e-7",
            "extra": "mean: 2.486882000267619 usec\nrounds: 155958"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 403265.57857833937,
            "unit": "iter/sec",
            "range": "stddev: 4.4418038176338273e-7",
            "extra": "mean: 2.479755409636921 usec\nrounds: 141784"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 403562.19744254847,
            "unit": "iter/sec",
            "range": "stddev: 4.6860641205949556e-7",
            "extra": "mean: 2.477932785422403 usec\nrounds: 141383"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 406223.187204933,
            "unit": "iter/sec",
            "range": "stddev: 4.5227741571861403e-7",
            "extra": "mean: 2.4617009355881896 usec\nrounds: 137666"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 408747.20017039974,
            "unit": "iter/sec",
            "range": "stddev: 5.469386414985086e-7",
            "extra": "mean: 2.4464999383068973 usec\nrounds: 129618"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 57.62548274450783,
            "unit": "iter/sec",
            "range": "stddev: 0.0019505727945868347",
            "extra": "mean: 17.35343380000245 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 43.74799885716355,
            "unit": "iter/sec",
            "range": "stddev: 0.009471973960293954",
            "extra": "mean: 22.858188399999335 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 44.50122167424603,
            "unit": "iter/sec",
            "range": "stddev: 0.0005151269659905121",
            "extra": "mean: 22.471293199996012 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 414887.76911907713,
            "unit": "iter/sec",
            "range": "stddev: 4.766452310039941e-7",
            "extra": "mean: 2.410290383163813 usec\nrounds: 158680"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 832722.6701215236,
            "unit": "iter/sec",
            "range": "stddev: 5.054925045884357e-7",
            "extra": "mean: 1.2008799998852737 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 188593.13292284936,
            "unit": "iter/sec",
            "range": "stddev: 0.0000012656446204331683",
            "extra": "mean: 5.302420000674601 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4161.826001676943,
            "unit": "iter/sec",
            "range": "stddev: 0.000007081316704740837",
            "extra": "mean: 240.27914660465518 usec\nrounds: 4079"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4143.45178971299,
            "unit": "iter/sec",
            "range": "stddev: 0.000005507789363124953",
            "extra": "mean: 241.34466882967362 usec\nrounds: 4007"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 2736.784180437706,
            "unit": "iter/sec",
            "range": "stddev: 0.00001406965854340283",
            "extra": "mean: 365.3923488552413 usec\nrounds: 2577"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2640.085594172687,
            "unit": "iter/sec",
            "range": "stddev: 0.000007110425023497698",
            "extra": "mean: 378.77559811213854 usec\nrounds: 2436"
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
          "id": "7e7702cb28765be4d291e89f8a2434eedeaad798",
          "message": "Merge pull request #8 from albertobadia/dev\n\nNEXT RELEASE",
          "timestamp": "2026-02-20T13:54:09-03:00",
          "tree_id": "b3b7aff60e682beff5f4558e96e596ba847b3d9f",
          "url": "https://github.com/albertobadia/zoocache/commit/7e7702cb28765be4d291e89f8a2434eedeaad798"
        },
        "date": 1771606616311,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 375468.0318491608,
            "unit": "iter/sec",
            "range": "stddev: 4.988438930753217e-7",
            "extra": "mean: 2.6633425889150972 usec\nrounds: 10012"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.761833633466026,
            "unit": "iter/sec",
            "range": "stddev: 0.0002379728415039388",
            "extra": "mean: 102.43977080000093 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 41743.422382431265,
            "unit": "iter/sec",
            "range": "stddev: 0.000013521621745226118",
            "extra": "mean: 23.955870001231006 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 164.72164026545596,
            "unit": "iter/sec",
            "range": "stddev: 0.00010201022186843483",
            "extra": "mean: 6.070847754966848 msec\nrounds: 151"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 176.9998653127168,
            "unit": "iter/sec",
            "range": "stddev: 0.00010884906993196582",
            "extra": "mean: 5.64972181325244 msec\nrounds: 166"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 177.92754895499783,
            "unit": "iter/sec",
            "range": "stddev: 0.00006797487759243164",
            "extra": "mean: 5.62026513529349 msec\nrounds: 170"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1003.1016179778304,
            "unit": "iter/sec",
            "range": "stddev: 0.000034503273947665786",
            "extra": "mean: 996.9079723108382 usec\nrounds: 939"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 143.33179222990748,
            "unit": "iter/sec",
            "range": "stddev: 0.0000861940362695673",
            "extra": "mean: 6.976819199999795 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6064.54469032534,
            "unit": "iter/sec",
            "range": "stddev: 0.000010901400781177576",
            "extra": "mean: 164.89284044609025 usec\nrounds: 4124"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5048.44388721705,
            "unit": "iter/sec",
            "range": "stddev: 0.000012830817990615903",
            "extra": "mean: 198.08083883670716 usec\nrounds: 4058"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 69.91610573730834,
            "unit": "iter/sec",
            "range": "stddev: 0.0020186940908443834",
            "extra": "mean: 14.302856108108207 msec\nrounds: 37"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 69.88489076543644,
            "unit": "iter/sec",
            "range": "stddev: 0.0014323950783240694",
            "extra": "mean: 14.309244659999933 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 403261.9732965635,
            "unit": "iter/sec",
            "range": "stddev: 5.085033261598284e-7",
            "extra": "mean: 2.4797775793865604 usec\nrounds: 68321"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 397511.3363672536,
            "unit": "iter/sec",
            "range": "stddev: 5.226599294919548e-7",
            "extra": "mean: 2.5156515261645715 usec\nrounds: 145922"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 386505.4471619362,
            "unit": "iter/sec",
            "range": "stddev: 0.0000013130760099735078",
            "extra": "mean: 2.5872856575318197 usec\nrounds: 148545"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 382098.7030374762,
            "unit": "iter/sec",
            "range": "stddev: 0.0000015232052873358796",
            "extra": "mean: 2.617124821546228 usec\nrounds: 142187"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 398768.7128822296,
            "unit": "iter/sec",
            "range": "stddev: 5.045963100235258e-7",
            "extra": "mean: 2.507719306191745 usec\nrounds: 130124"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 400539.08578907157,
            "unit": "iter/sec",
            "range": "stddev: 5.134327672537014e-7",
            "extra": "mean: 2.496635248542539 usec\nrounds: 96526"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 57.00850276118938,
            "unit": "iter/sec",
            "range": "stddev: 0.0020162208224565287",
            "extra": "mean: 17.541242999996598 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 39.734240236116804,
            "unit": "iter/sec",
            "range": "stddev: 0.013141471178126982",
            "extra": "mean: 25.167210799995132 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 43.8134509134555,
            "unit": "iter/sec",
            "range": "stddev: 0.0012701165295224263",
            "extra": "mean: 22.824040999995532 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 400289.8591020537,
            "unit": "iter/sec",
            "range": "stddev: 5.012590222705981e-7",
            "extra": "mean: 2.4981896924474682 usec\nrounds: 152626"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 811056.3201368499,
            "unit": "iter/sec",
            "range": "stddev: 5.266025839433172e-7",
            "extra": "mean: 1.2329599994131968 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 184945.099045438,
            "unit": "iter/sec",
            "range": "stddev: 0.000002259243810619719",
            "extra": "mean: 5.407010000055834 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4140.6791565898375,
            "unit": "iter/sec",
            "range": "stddev: 0.000011461304560381767",
            "extra": "mean: 241.50627522263176 usec\nrounds: 4044"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4032.410691602737,
            "unit": "iter/sec",
            "range": "stddev: 0.000016235130460492845",
            "extra": "mean: 247.99061317897068 usec\nrounds: 3976"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 2665.4871085732866,
            "unit": "iter/sec",
            "range": "stddev: 0.000045438300736604884",
            "extra": "mean: 375.1659487617085 usec\nrounds: 2342"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2625.587634822672,
            "unit": "iter/sec",
            "range": "stddev: 0.00002094688998103079",
            "extra": "mean: 380.86711970196274 usec\nrounds: 2147"
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
          "id": "7e7702cb28765be4d291e89f8a2434eedeaad798",
          "message": "Merge pull request #8 from albertobadia/dev\n\nNEXT RELEASE",
          "timestamp": "2026-02-20T13:54:09-03:00",
          "tree_id": "b3b7aff60e682beff5f4558e96e596ba847b3d9f",
          "url": "https://github.com/albertobadia/zoocache/commit/7e7702cb28765be4d291e89f8a2434eedeaad798"
        },
        "date": 1771606849444,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 398330.09324385296,
            "unit": "iter/sec",
            "range": "stddev: 3.671769485967095e-7",
            "extra": "mean: 2.510480671586648 usec\nrounds: 12210"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.784159408345905,
            "unit": "iter/sec",
            "range": "stddev: 0.00011659215233844142",
            "extra": "mean: 102.20602080000845 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 124584.35544931387,
            "unit": "iter/sec",
            "range": "stddev: 0.0000068285120686630016",
            "extra": "mean: 8.02668999966727 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 167.33836976478332,
            "unit": "iter/sec",
            "range": "stddev: 0.00007015967622296185",
            "extra": "mean: 5.97591575324676 msec\nrounds: 154"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 182.61291657100364,
            "unit": "iter/sec",
            "range": "stddev: 0.000041338852234923734",
            "extra": "mean: 5.476063899407572 msec\nrounds: 169"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 182.44526047663288,
            "unit": "iter/sec",
            "range": "stddev: 0.000046228655970473346",
            "extra": "mean: 5.481096068966272 msec\nrounds: 174"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1187.8686755748242,
            "unit": "iter/sec",
            "range": "stddev: 0.00003316122327427007",
            "extra": "mean: 841.8439012343581 usec\nrounds: 1053"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 143.44940034711325,
            "unit": "iter/sec",
            "range": "stddev: 0.00011220344138675632",
            "extra": "mean: 6.971099199998321 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 7847.13262503409,
            "unit": "iter/sec",
            "range": "stddev: 0.0000044237309605283454",
            "extra": "mean: 127.43508333346867 usec\nrounds: 5208"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 6475.081652315107,
            "unit": "iter/sec",
            "range": "stddev: 0.000005901767805877388",
            "extra": "mean: 154.43820691318373 usec\nrounds: 4166"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 56.01025856322509,
            "unit": "iter/sec",
            "range": "stddev: 0.0010842161785242026",
            "extra": "mean: 17.853872230766214 msec\nrounds: 39"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 62.565897531576354,
            "unit": "iter/sec",
            "range": "stddev: 0.0009612403929768692",
            "extra": "mean: 15.983147999999687 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 423076.84408341505,
            "unit": "iter/sec",
            "range": "stddev: 3.220633974261816e-7",
            "extra": "mean: 2.3636368049555485 usec\nrounds: 59731"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 414523.10008185497,
            "unit": "iter/sec",
            "range": "stddev: 3.735385813760219e-7",
            "extra": "mean: 2.4124107915880497 usec\nrounds: 170040"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 400950.0179711914,
            "unit": "iter/sec",
            "range": "stddev: 0.000001402098081148786",
            "extra": "mean: 2.494076456362326 usec\nrounds: 160876"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 415444.9299876504,
            "unit": "iter/sec",
            "range": "stddev: 3.0789106443330493e-7",
            "extra": "mean: 2.407057898214635 usec\nrounds: 134391"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 403251.6798530499,
            "unit": "iter/sec",
            "range": "stddev: 3.4334431186936177e-7",
            "extra": "mean: 2.4798408784420016 usec\nrounds: 97944"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 416643.5491053781,
            "unit": "iter/sec",
            "range": "stddev: 3.181578705415968e-7",
            "extra": "mean: 2.4001331645412765 usec\nrounds: 74622"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 60.73973219121505,
            "unit": "iter/sec",
            "range": "stddev: 0.0033233726006279213",
            "extra": "mean: 16.463688000004595 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 46.33700550084774,
            "unit": "iter/sec",
            "range": "stddev: 0.011430099334931448",
            "extra": "mean: 21.58102340000596 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 47.42791942747159,
            "unit": "iter/sec",
            "range": "stddev: 0.0009895042936036564",
            "extra": "mean: 21.084627200002615 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 418220.8243459551,
            "unit": "iter/sec",
            "range": "stddev: 3.855502617081394e-7",
            "extra": "mean: 2.3910813182578234 usec\nrounds: 170503"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 919878.5762148135,
            "unit": "iter/sec",
            "range": "stddev: 4.96815139372159e-7",
            "extra": "mean: 1.0870999997791841 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 192584.71804771142,
            "unit": "iter/sec",
            "range": "stddev: 0.000001468154757493257",
            "extra": "mean: 5.192519999184242 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4246.308415632835,
            "unit": "iter/sec",
            "range": "stddev: 0.000005233312906182174",
            "extra": "mean: 235.49867369936865 usec\nrounds: 4171"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4187.433094539324,
            "unit": "iter/sec",
            "range": "stddev: 0.000017445385604350347",
            "extra": "mean: 238.80978571432289 usec\nrounds: 4004"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 2782.235391867404,
            "unit": "iter/sec",
            "range": "stddev: 0.0000064169005831078515",
            "extra": "mean: 359.4232187984682 usec\nrounds: 2564"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2688.0324229539146,
            "unit": "iter/sec",
            "range": "stddev: 0.000022622188103284594",
            "extra": "mean: 372.01932218551394 usec\nrounds: 2452"
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
          "id": "7e7702cb28765be4d291e89f8a2434eedeaad798",
          "message": "Merge pull request #8 from albertobadia/dev\n\nNEXT RELEASE",
          "timestamp": "2026-02-20T13:54:09-03:00",
          "tree_id": "b3b7aff60e682beff5f4558e96e596ba847b3d9f",
          "url": "https://github.com/albertobadia/zoocache/commit/7e7702cb28765be4d291e89f8a2434eedeaad798"
        },
        "date": 1771607071405,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 388204.2295679527,
            "unit": "iter/sec",
            "range": "stddev: 5.226284755010371e-7",
            "extra": "mean: 2.57596369084628 usec\nrounds: 10686"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.79002656472805,
            "unit": "iter/sec",
            "range": "stddev: 0.0001570592369208812",
            "extra": "mean: 102.1447687999995 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 59270.04201321072,
            "unit": "iter/sec",
            "range": "stddev: 0.0000074980873896695915",
            "extra": "mean: 16.871930000945667 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 166.36257597991903,
            "unit": "iter/sec",
            "range": "stddev: 0.00006272904564228719",
            "extra": "mean: 6.010967275000034 msec\nrounds: 160"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 179.17072825210732,
            "unit": "iter/sec",
            "range": "stddev: 0.0000566392822185193",
            "extra": "mean: 5.581268825301202 msec\nrounds: 166"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 178.75797008517895,
            "unit": "iter/sec",
            "range": "stddev: 0.00005910268912525589",
            "extra": "mean: 5.594156162790927 msec\nrounds: 172"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1049.643831816108,
            "unit": "iter/sec",
            "range": "stddev: 0.000015157273497289632",
            "extra": "mean: 952.7041170430034 usec\nrounds: 974"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 144.97155926204846,
            "unit": "iter/sec",
            "range": "stddev: 0.00009957730524874272",
            "extra": "mean: 6.897904699999913 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6351.559356529922,
            "unit": "iter/sec",
            "range": "stddev: 0.000008105368747363268",
            "extra": "mean: 157.44165233564544 usec\nrounds: 4838"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5251.2622341483775,
            "unit": "iter/sec",
            "range": "stddev: 0.000009617551074938696",
            "extra": "mean: 190.43040614066283 usec\nrounds: 4006"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 88.63900749621614,
            "unit": "iter/sec",
            "range": "stddev: 0.0007605417637407036",
            "extra": "mean: 11.281714769230561 msec\nrounds: 39"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 84.07920246073655,
            "unit": "iter/sec",
            "range": "stddev: 0.0007084641855067652",
            "extra": "mean: 11.893547640000293 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 420701.6180754658,
            "unit": "iter/sec",
            "range": "stddev: 5.058224976802487e-7",
            "extra": "mean: 2.376981587507513 usec\nrounds: 116334"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 417485.9192986549,
            "unit": "iter/sec",
            "range": "stddev: 4.7131951117660816e-7",
            "extra": "mean: 2.395290364953925 usec\nrounds: 150762"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 404412.9485835068,
            "unit": "iter/sec",
            "range": "stddev: 7.973725244047937e-7",
            "extra": "mean: 2.472720034070598 usec\nrounds: 151447"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 414927.8443883268,
            "unit": "iter/sec",
            "range": "stddev: 4.553411792119473e-7",
            "extra": "mean: 2.4100575883842352 usec\nrounds: 136538"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 403559.46151717944,
            "unit": "iter/sec",
            "range": "stddev: 5.752516040268797e-7",
            "extra": "mean: 2.477949584530879 usec\nrounds: 134899"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 402871.5215438572,
            "unit": "iter/sec",
            "range": "stddev: 5.302461322051066e-7",
            "extra": "mean: 2.482180910102226 usec\nrounds: 131148"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 58.27171070789753,
            "unit": "iter/sec",
            "range": "stddev: 0.0020257521987788935",
            "extra": "mean: 17.16098580000107 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 44.95903112783814,
            "unit": "iter/sec",
            "range": "stddev: 0.00893716427700642",
            "extra": "mean: 22.242472200002794 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 45.340102912959566,
            "unit": "iter/sec",
            "range": "stddev: 0.0009585580728171112",
            "extra": "mean: 22.055530000002932 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 417607.1210306043,
            "unit": "iter/sec",
            "range": "stddev: 4.579882009897227e-7",
            "extra": "mean: 2.3945951820268774 usec\nrounds: 159694"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 849451.678308272,
            "unit": "iter/sec",
            "range": "stddev: 4.7119902706039964e-7",
            "extra": "mean: 1.1772300008772163 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 194367.6152627171,
            "unit": "iter/sec",
            "range": "stddev: 0.0000011607235020993736",
            "extra": "mean: 5.144889999542102 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4159.850627842443,
            "unit": "iter/sec",
            "range": "stddev: 0.000006341866844048894",
            "extra": "mean: 240.39324712932353 usec\nrounds: 4006"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4093.8989575691503,
            "unit": "iter/sec",
            "range": "stddev: 0.000008430605196567703",
            "extra": "mean: 244.26592115838972 usec\nrounds: 3729"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 2730.6815642291463,
            "unit": "iter/sec",
            "range": "stddev: 0.000013927490811551174",
            "extra": "mean: 366.20893959208075 usec\nrounds: 2599"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2582.1498317482824,
            "unit": "iter/sec",
            "range": "stddev: 0.00004113419282036208",
            "extra": "mean: 387.2741959837921 usec\nrounds: 2490"
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
          "id": "7e7702cb28765be4d291e89f8a2434eedeaad798",
          "message": "Merge pull request #8 from albertobadia/dev\n\nNEXT RELEASE",
          "timestamp": "2026-02-20T13:54:09-03:00",
          "tree_id": "b3b7aff60e682beff5f4558e96e596ba847b3d9f",
          "url": "https://github.com/albertobadia/zoocache/commit/7e7702cb28765be4d291e89f8a2434eedeaad798"
        },
        "date": 1771607317077,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 381597.34738135745,
            "unit": "iter/sec",
            "range": "stddev: 4.6611650216859107e-7",
            "extra": "mean: 2.6205632897144553 usec\nrounds: 9180"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.76939654040907,
            "unit": "iter/sec",
            "range": "stddev: 0.00019483618561748462",
            "extra": "mean: 102.36046780000265 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 66084.50622259435,
            "unit": "iter/sec",
            "range": "stddev: 0.000010056399983680481",
            "extra": "mean: 15.132140000133631 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 165.9744669398832,
            "unit": "iter/sec",
            "range": "stddev: 0.0000971559311099009",
            "extra": "mean: 6.025023116129091 msec\nrounds: 155"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 179.73516947135008,
            "unit": "iter/sec",
            "range": "stddev: 0.00005318152923031099",
            "extra": "mean: 5.563741380951049 msec\nrounds: 168"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 178.73461421718076,
            "unit": "iter/sec",
            "range": "stddev: 0.00008191991854589183",
            "extra": "mean: 5.594887170455401 msec\nrounds: 176"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1020.2866847902155,
            "unit": "iter/sec",
            "range": "stddev: 0.0000446313233060344",
            "extra": "mean: 980.1166818183198 usec\nrounds: 946"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 145.36016178000034,
            "unit": "iter/sec",
            "range": "stddev: 0.00010279486719510875",
            "extra": "mean: 6.8794640000021445 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6198.637828933212,
            "unit": "iter/sec",
            "range": "stddev: 0.000013488971151138376",
            "extra": "mean: 161.32576665994702 usec\nrounds: 4937"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5193.5449451791765,
            "unit": "iter/sec",
            "range": "stddev: 0.000010180861024649478",
            "extra": "mean: 192.54671145731274 usec\nrounds: 3788"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 78.39398425470549,
            "unit": "iter/sec",
            "range": "stddev: 0.0009756917054336017",
            "extra": "mean: 12.756080833332264 msec\nrounds: 36"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 72.96649244408518,
            "unit": "iter/sec",
            "range": "stddev: 0.0011836944758652486",
            "extra": "mean: 13.704920800000195 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 408693.7435406029,
            "unit": "iter/sec",
            "range": "stddev: 5.149747539011711e-7",
            "extra": "mean: 2.4468199374347703 usec\nrounds: 61051"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 402322.63469077874,
            "unit": "iter/sec",
            "range": "stddev: 5.132502532711728e-7",
            "extra": "mean: 2.4855673376880483 usec\nrounds: 131338"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 403151.5461615183,
            "unit": "iter/sec",
            "range": "stddev: 4.906628362904773e-7",
            "extra": "mean: 2.480456814617699 usec\nrounds: 141784"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 399410.83026842785,
            "unit": "iter/sec",
            "range": "stddev: 5.471998060558408e-7",
            "extra": "mean: 2.5036877425881032 usec\nrounds: 34526"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 400983.1173794952,
            "unit": "iter/sec",
            "range": "stddev: 4.80279702902825e-7",
            "extra": "mean: 2.4938705812234687 usec\nrounds: 124611"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 402351.38709845464,
            "unit": "iter/sec",
            "range": "stddev: 4.701657427761108e-7",
            "extra": "mean: 2.4853897167137187 usec\nrounds: 84020"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 58.2848729585577,
            "unit": "iter/sec",
            "range": "stddev: 0.0017283024797877878",
            "extra": "mean: 17.157110400000875 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 42.92961553017622,
            "unit": "iter/sec",
            "range": "stddev: 0.009438427928865019",
            "extra": "mean: 23.29394260000015 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 42.49057701345859,
            "unit": "iter/sec",
            "range": "stddev: 0.0010665631411884411",
            "extra": "mean: 23.534629799996765 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 408620.70629263384,
            "unit": "iter/sec",
            "range": "stddev: 4.5511750520240166e-7",
            "extra": "mean: 2.4472572843233493 usec\nrounds: 147646"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 857022.8742413586,
            "unit": "iter/sec",
            "range": "stddev: 4.96769138039685e-7",
            "extra": "mean: 1.1668299995903908 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 190809.4710544105,
            "unit": "iter/sec",
            "range": "stddev: 0.0000020277932773131984",
            "extra": "mean: 5.240829999024754 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4117.0310905141005,
            "unit": "iter/sec",
            "range": "stddev: 0.000005712216339258975",
            "extra": "mean: 242.8934778520529 usec\nrounds: 4041"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4068.559695817187,
            "unit": "iter/sec",
            "range": "stddev: 0.000007625746302475875",
            "extra": "mean: 245.7872256435323 usec\nrounds: 3962"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 2716.9989137799053,
            "unit": "iter/sec",
            "range": "stddev: 0.000011852518919496267",
            "extra": "mean: 368.05314677465 usec\nrounds: 2589"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2614.2340917978345,
            "unit": "iter/sec",
            "range": "stddev: 0.00017423439461201678",
            "extra": "mean: 382.5212145834615 usec\nrounds: 2400"
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
          "id": "f2719b5b8fa67118701c14c61d8b20f0e4f34f60",
          "message": "FIX: benchmarks gh actions config",
          "timestamp": "2026-02-20T14:13:09-03:00",
          "tree_id": "d1ad44b6c5869eb6a6e9137c2d9c18d68afccda0",
          "url": "https://github.com/albertobadia/zoocache/commit/f2719b5b8fa67118701c14c61d8b20f0e4f34f60"
        },
        "date": 1771607763803,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 387553.146464996,
            "unit": "iter/sec",
            "range": "stddev: 4.7184521881121594e-7",
            "extra": "mean: 2.580291268749435 usec\nrounds: 11831"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.795337491839296,
            "unit": "iter/sec",
            "range": "stddev: 0.00011228556607810483",
            "extra": "mean: 102.0893870000009 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 52102.573294568356,
            "unit": "iter/sec",
            "range": "stddev: 0.0000043581171102557915",
            "extra": "mean: 19.192909999787844 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 166.44001134372243,
            "unit": "iter/sec",
            "range": "stddev: 0.0000604249491666952",
            "extra": "mean: 6.008170703226263 msec\nrounds: 155"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 180.04581469240745,
            "unit": "iter/sec",
            "range": "stddev: 0.00003790740283712305",
            "extra": "mean: 5.554141881656137 msec\nrounds: 169"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 179.78636501977547,
            "unit": "iter/sec",
            "range": "stddev: 0.00004165140528523657",
            "extra": "mean: 5.562157062856272 msec\nrounds: 175"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1018.9525756661633,
            "unit": "iter/sec",
            "range": "stddev: 0.000013011734623742361",
            "extra": "mean: 981.399943315544 usec\nrounds: 935"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 143.88733299516682,
            "unit": "iter/sec",
            "range": "stddev: 0.00009060907130852109",
            "extra": "mean: 6.949882100001048 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6308.705373857211,
            "unit": "iter/sec",
            "range": "stddev: 0.00000814515425266117",
            "extra": "mean: 158.51112720272576 usec\nrounds: 4937"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5248.756451776213,
            "unit": "iter/sec",
            "range": "stddev: 0.000012213164800335088",
            "extra": "mean: 190.52131856138865 usec\nrounds: 4310"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 90.32180105606726,
            "unit": "iter/sec",
            "range": "stddev: 0.0005007567345929919",
            "extra": "mean: 11.071524131579816 msec\nrounds: 38"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 85.54211544070247,
            "unit": "iter/sec",
            "range": "stddev: 0.0003932276841048966",
            "extra": "mean: 11.690148120000572 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 418393.5829796674,
            "unit": "iter/sec",
            "range": "stddev: 5.306071243190677e-7",
            "extra": "mean: 2.390094018360212 usec\nrounds: 101544"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 406128.34004895965,
            "unit": "iter/sec",
            "range": "stddev: 4.380022462530712e-7",
            "extra": "mean: 2.462275840881845 usec\nrounds: 157928"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 395544.5030438146,
            "unit": "iter/sec",
            "range": "stddev: 9.478489252455604e-7",
            "extra": "mean: 2.528160528852627 usec\nrounds: 154751"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 402649.1442029708,
            "unit": "iter/sec",
            "range": "stddev: 4.4024422549882056e-7",
            "extra": "mean: 2.483551782978363 usec\nrounds: 141784"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 406179.9548043482,
            "unit": "iter/sec",
            "range": "stddev: 4.667017790571831e-7",
            "extra": "mean: 2.4619629505884593 usec\nrounds: 131338"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 408739.49483351124,
            "unit": "iter/sec",
            "range": "stddev: 4.355784460745028e-7",
            "extra": "mean: 2.4465460584065224 usec\nrounds: 129618"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 58.83869248894114,
            "unit": "iter/sec",
            "range": "stddev: 0.002267627139215781",
            "extra": "mean: 16.99561899999651 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 43.513286037798665,
            "unit": "iter/sec",
            "range": "stddev: 0.010123534830431094",
            "extra": "mean: 22.98148660000834 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 45.12768684945275,
            "unit": "iter/sec",
            "range": "stddev: 0.0007167579142702935",
            "extra": "mean: 22.159345399998642 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 409086.36629969254,
            "unit": "iter/sec",
            "range": "stddev: 4.751121894178121e-7",
            "extra": "mean: 2.444471589325492 usec\nrounds: 149187"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 876808.4169743361,
            "unit": "iter/sec",
            "range": "stddev: 3.8075038898458776e-7",
            "extra": "mean: 1.1405000005026977 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 199261.53674365688,
            "unit": "iter/sec",
            "range": "stddev: 7.673820569167908e-7",
            "extra": "mean: 5.018530000029386 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4115.748971644771,
            "unit": "iter/sec",
            "range": "stddev: 0.000005833993254292836",
            "extra": "mean: 242.96914289220402 usec\nrounds: 4080"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4070.134108466199,
            "unit": "iter/sec",
            "range": "stddev: 0.000005916697678038793",
            "extra": "mean: 245.6921500252096 usec\nrounds: 3966"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 2736.869023027698,
            "unit": "iter/sec",
            "range": "stddev: 0.000014377049597293857",
            "extra": "mean: 365.38102173911733 usec\nrounds: 2668"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2634.4948568139907,
            "unit": "iter/sec",
            "range": "stddev: 0.000007727308780007327",
            "extra": "mean: 379.5794087103831 usec\nrounds: 2388"
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
          "id": "2077a8b14d27fb692bc6008219d6c7f41b0801bb",
          "message": "Merge pull request #9 from albertobadia/dev\n\nNEXT RELEASE",
          "timestamp": "2026-02-23T12:31:38-03:00",
          "tree_id": "7fb39438ba144d49d17eaba9fca5e6284faffe97",
          "url": "https://github.com/albertobadia/zoocache/commit/2077a8b14d27fb692bc6008219d6c7f41b0801bb"
        },
        "date": 1771860821932,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 353860.05901417014,
            "unit": "iter/sec",
            "range": "stddev: 0.0000010761429541236093",
            "extra": "mean: 2.8259759035420142 usec\nrounds: 1909"
          },
          {
            "name": "benchmarks/test_core.py::test_bulk_read",
            "value": 374.9015948922392,
            "unit": "iter/sec",
            "range": "stddev: 0.00003482099144655695",
            "extra": "mean: 2.667366619999143 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.796279951638207,
            "unit": "iter/sec",
            "range": "stddev: 0.00010269159281402233",
            "extra": "mean: 102.07956540000396 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 131667.30305245766,
            "unit": "iter/sec",
            "range": "stddev: 0.000008187997167001155",
            "extra": "mean: 7.59490000035612 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 166.3481324865581,
            "unit": "iter/sec",
            "range": "stddev: 0.0000458023475852972",
            "extra": "mean: 6.011489188679685 msec\nrounds: 159"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 179.7897647672497,
            "unit": "iter/sec",
            "range": "stddev: 0.00005025926523815759",
            "extra": "mean: 5.562051884847667 msec\nrounds: 165"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 179.15067174634038,
            "unit": "iter/sec",
            "range": "stddev: 0.0001474053310692293",
            "extra": "mean: 5.581893666666799 msec\nrounds: 177"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1042.9238384839496,
            "unit": "iter/sec",
            "range": "stddev: 0.000016367369160354644",
            "extra": "mean: 958.8427870760477 usec\nrounds: 944"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 146.3224943092193,
            "unit": "iter/sec",
            "range": "stddev: 0.0000614373959306965",
            "extra": "mean: 6.834219200000291 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6217.978752013171,
            "unit": "iter/sec",
            "range": "stddev: 0.000009590708345660258",
            "extra": "mean: 160.82396545279826 usec\nrounds: 4284"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5109.865854969727,
            "unit": "iter/sec",
            "range": "stddev: 0.00001240533622343243",
            "extra": "mean: 195.6998536522099 usec\nrounds: 3847"
          },
          {
            "name": "benchmarks/test_fastapi.py::test_fastapi_baseline",
            "value": 148.46669609177854,
            "unit": "iter/sec",
            "range": "stddev: 0.00011544892740239721",
            "extra": "mean: 6.735517299999888 msec\nrounds: 90"
          },
          {
            "name": "benchmarks/test_fastapi.py::test_fastapi_cached_hit",
            "value": 572.4646175455687,
            "unit": "iter/sec",
            "range": "stddev: 0.00012283193894549417",
            "extra": "mean: 1.7468328510633222 msec\nrounds: 376"
          },
          {
            "name": "benchmarks/test_fastapi.py::test_fastapi_cached_miss",
            "value": 138.29645568449152,
            "unit": "iter/sec",
            "range": "stddev: 0.00031728707871048596",
            "extra": "mean: 7.230843300000345 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 73.91788205309322,
            "unit": "iter/sec",
            "range": "stddev: 0.001541814291307919",
            "extra": "mean: 13.528526145834737 msec\nrounds: 48"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 155.4142482240875,
            "unit": "iter/sec",
            "range": "stddev: 0.00038554283195129486",
            "extra": "mean: 6.4344164800007775 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 374321.7343376827,
            "unit": "iter/sec",
            "range": "stddev: 5.195247673687753e-7",
            "extra": "mean: 2.67149862876485 usec\nrounds: 94074"
          },
          {
            "name": "benchmarks/test_litestar.py::test_litestar_baseline",
            "value": 150.01244662093745,
            "unit": "iter/sec",
            "range": "stddev: 0.0001006005910769074",
            "extra": "mean: 6.666113529411822 msec\nrounds: 119"
          },
          {
            "name": "benchmarks/test_litestar.py::test_litestar_cached_hit",
            "value": 563.0837302697638,
            "unit": "iter/sec",
            "range": "stddev: 0.0017624922172129105",
            "extra": "mean: 1.7759348143852727 msec\nrounds: 431"
          },
          {
            "name": "benchmarks/test_litestar.py::test_litestar_cached_miss",
            "value": 141.29608354103135,
            "unit": "iter/sec",
            "range": "stddev: 0.00031737248800434457",
            "extra": "mean: 7.077336999999773 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 373556.3342716618,
            "unit": "iter/sec",
            "range": "stddev: 5.284005723774204e-7",
            "extra": "mean: 2.676972408859674 usec\nrounds: 32148"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 364905.191970354,
            "unit": "iter/sec",
            "range": "stddev: 0.0000010988265427396812",
            "extra": "mean: 2.740437850720532 usec\nrounds: 143823"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 361829.8626087827,
            "unit": "iter/sec",
            "range": "stddev: 0.000001518455574000714",
            "extra": "mean: 2.7637298723494776 usec\nrounds: 129635"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 361560.3360159234,
            "unit": "iter/sec",
            "range": "stddev: 6.347217922624137e-7",
            "extra": "mean: 2.7657901057929077 usec\nrounds: 127812"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 362749.32071495766,
            "unit": "iter/sec",
            "range": "stddev: 5.495675722309433e-7",
            "extra": "mean: 2.756724666028481 usec\nrounds: 129283"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 140.70476597154388,
            "unit": "iter/sec",
            "range": "stddev: 0.0015422417217543618",
            "extra": "mean: 7.107079799999383 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 93.87457684392301,
            "unit": "iter/sec",
            "range": "stddev: 0.0011698359851422758",
            "extra": "mean: 10.652511399999298 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 56.6352044136253,
            "unit": "iter/sec",
            "range": "stddev: 0.00032847667763393314",
            "extra": "mean: 17.656862199996226 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 372242.9719404625,
            "unit": "iter/sec",
            "range": "stddev: 5.0732809695746e-7",
            "extra": "mean: 2.686417408466056 usec\nrounds: 149858"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 668699.5135873801,
            "unit": "iter/sec",
            "range": "stddev: 6.496782461350814e-7",
            "extra": "mean: 1.4954399991040646 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 167776.22677857586,
            "unit": "iter/sec",
            "range": "stddev: 0.0000015687662009148584",
            "extra": "mean: 5.9603200000424295 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 3870.649970152331,
            "unit": "iter/sec",
            "range": "stddev: 0.00000745786190597567",
            "extra": "mean: 258.3545419273974 usec\nrounds: 3196"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 3818.2034731647773,
            "unit": "iter/sec",
            "range": "stddev: 0.000012953011624961022",
            "extra": "mean: 261.90327650902645 usec\nrounds: 3678"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 2677.7863648312364,
            "unit": "iter/sec",
            "range": "stddev: 0.000008556938109894592",
            "extra": "mean: 373.4427858523447 usec\nrounds: 2587"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2586.2369321197925,
            "unit": "iter/sec",
            "range": "stddev: 0.000009880840486529472",
            "extra": "mean: 386.66217606766463 usec\nrounds: 2482"
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
          "id": "cf04952a05ef0af6cc44a41460f860d29db1290f",
          "message": "UPDATE: Release",
          "timestamp": "2026-02-23T12:35:03-03:00",
          "tree_id": "5619bfc709ea1125bc260a11d1fe8a4118f79f43",
          "url": "https://github.com/albertobadia/zoocache/commit/cf04952a05ef0af6cc44a41460f860d29db1290f"
        },
        "date": 1771861042611,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 353068.990284176,
            "unit": "iter/sec",
            "range": "stddev: 0.000001193767115296198",
            "extra": "mean: 2.8323076438832144 usec\nrounds: 1609"
          },
          {
            "name": "benchmarks/test_core.py::test_bulk_read",
            "value": 367.8776234191337,
            "unit": "iter/sec",
            "range": "stddev: 0.00006962215971093524",
            "extra": "mean: 2.718295259999195 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.76543922777726,
            "unit": "iter/sec",
            "range": "stddev: 0.00011050453495016154",
            "extra": "mean: 102.40194799999927 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 65433.67806504048,
            "unit": "iter/sec",
            "range": "stddev: 0.000018334343848099452",
            "extra": "mean: 15.282649998766827 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 160.1161932039095,
            "unit": "iter/sec",
            "range": "stddev: 0.0001109098193527416",
            "extra": "mean: 6.245464496688917 msec\nrounds: 151"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 169.53658137625214,
            "unit": "iter/sec",
            "range": "stddev: 0.00010006315433289233",
            "extra": "mean: 5.898432019109211 msec\nrounds: 157"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 169.4423521792491,
            "unit": "iter/sec",
            "range": "stddev: 0.00008175235540101804",
            "extra": "mean: 5.901712217392517 msec\nrounds: 161"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1044.8437454563434,
            "unit": "iter/sec",
            "range": "stddev: 0.00002294350677844356",
            "extra": "mean: 957.0809074071094 usec\nrounds: 864"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 141.1342385750355,
            "unit": "iter/sec",
            "range": "stddev: 0.00009811012684495912",
            "extra": "mean: 7.085452899994493 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6239.8862035644215,
            "unit": "iter/sec",
            "range": "stddev: 0.000011152402906336213",
            "extra": "mean: 160.25933284308425 usec\nrounds: 4762"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5189.571849231998,
            "unit": "iter/sec",
            "range": "stddev: 0.000011638501936405655",
            "extra": "mean: 192.69412372583093 usec\nrounds: 4219"
          },
          {
            "name": "benchmarks/test_fastapi.py::test_fastapi_baseline",
            "value": 134.52794400567964,
            "unit": "iter/sec",
            "range": "stddev: 0.0001704823874696412",
            "extra": "mean: 7.433399858974883 msec\nrounds: 78"
          },
          {
            "name": "benchmarks/test_fastapi.py::test_fastapi_cached_hit",
            "value": 540.069260777238,
            "unit": "iter/sec",
            "range": "stddev: 0.00012926687833477254",
            "extra": "mean: 1.8516143625002002 msec\nrounds: 400"
          },
          {
            "name": "benchmarks/test_fastapi.py::test_fastapi_cached_miss",
            "value": 131.9287982386862,
            "unit": "iter/sec",
            "range": "stddev: 0.0002697906171907558",
            "extra": "mean: 7.5798461999994515 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 59.915976730169184,
            "unit": "iter/sec",
            "range": "stddev: 0.0014676692664650612",
            "extra": "mean: 16.69003919444536 msec\nrounds: 36"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 106.1456494725099,
            "unit": "iter/sec",
            "range": "stddev: 0.00038821187703742913",
            "extra": "mean: 9.42101729999763 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 380480.45633385266,
            "unit": "iter/sec",
            "range": "stddev: 4.747182317538793e-7",
            "extra": "mean: 2.628255888976725 usec\nrounds: 50772"
          },
          {
            "name": "benchmarks/test_litestar.py::test_litestar_baseline",
            "value": 137.6118343229661,
            "unit": "iter/sec",
            "range": "stddev: 0.00017024414652763687",
            "extra": "mean: 7.266816876033092 msec\nrounds: 121"
          },
          {
            "name": "benchmarks/test_litestar.py::test_litestar_cached_hit",
            "value": 518.3845708565389,
            "unit": "iter/sec",
            "range": "stddev: 0.0031092216736019742",
            "extra": "mean: 1.9290697605981535 msec\nrounds: 401"
          },
          {
            "name": "benchmarks/test_litestar.py::test_litestar_cached_miss",
            "value": 132.90137727678916,
            "unit": "iter/sec",
            "range": "stddev: 0.0004227086858587631",
            "extra": "mean: 7.524376500006724 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 381207.8606353029,
            "unit": "iter/sec",
            "range": "stddev: 5.675649018596564e-7",
            "extra": "mean: 2.6232407651128904 usec\nrounds: 77316"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 371015.8837611623,
            "unit": "iter/sec",
            "range": "stddev: 0.0000027710479282290314",
            "extra": "mean: 2.6953023947722405 usec\nrounds: 150535"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 372648.74973254075,
            "unit": "iter/sec",
            "range": "stddev: 0.0000013512578279629669",
            "extra": "mean: 2.683492164451712 usec\nrounds: 128453"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 374486.8774297083,
            "unit": "iter/sec",
            "range": "stddev: 6.400025490151218e-7",
            "extra": "mean: 2.6703205379678527 usec\nrounds: 112411"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 382712.6631027794,
            "unit": "iter/sec",
            "range": "stddev: 5.27153874314047e-7",
            "extra": "mean: 2.6129263450356355 usec\nrounds: 90408"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 131.79348635470325,
            "unit": "iter/sec",
            "range": "stddev: 0.002099192923557614",
            "extra": "mean: 7.5876284000003125 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 89.19534824852235,
            "unit": "iter/sec",
            "range": "stddev: 0.0013918140606669757",
            "extra": "mean: 11.211346999999705 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 54.223215244476826,
            "unit": "iter/sec",
            "range": "stddev: 0.0003321596271833444",
            "extra": "mean: 18.442285200006836 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 385210.34723585355,
            "unit": "iter/sec",
            "range": "stddev: 5.077384390485027e-7",
            "extra": "mean: 2.5959842646379587 usec\nrounds: 160721"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 640939.361389289,
            "unit": "iter/sec",
            "range": "stddev: 5.859372914900431e-7",
            "extra": "mean: 1.560209998388018 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 158427.88843664966,
            "unit": "iter/sec",
            "range": "stddev: 0.0000022800885376792025",
            "extra": "mean: 6.312019997665175 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 3781.8196027263907,
            "unit": "iter/sec",
            "range": "stddev: 0.00003694227723011913",
            "extra": "mean: 264.4229775738324 usec\nrounds: 1962"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 3803.404795751414,
            "unit": "iter/sec",
            "range": "stddev: 0.000027774663938760025",
            "extra": "mean: 262.9223166350971 usec\nrounds: 3733"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 2612.1921169879465,
            "unit": "iter/sec",
            "range": "stddev: 0.000012033460019554748",
            "extra": "mean: 382.82023496536505 usec\nrounds: 2328"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2526.334444690065,
            "unit": "iter/sec",
            "range": "stddev: 0.000013365701210741954",
            "extra": "mean: 395.8304103804758 usec\nrounds: 1445"
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
          "id": "9ee3a56878b929a730c4ec3ff4118ff7c0d0601c",
          "message": "UPDATE: Docs",
          "timestamp": "2026-02-23T13:08:53-03:00",
          "tree_id": "7c452426b21218d01b8893ead73c02ca4dc86680",
          "url": "https://github.com/albertobadia/zoocache/commit/9ee3a56878b929a730c4ec3ff4118ff7c0d0601c"
        },
        "date": 1771863062195,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 366140.05931348924,
            "unit": "iter/sec",
            "range": "stddev: 9.94855965667242e-7",
            "extra": "mean: 2.731195275040363 usec\nrounds: 2243"
          },
          {
            "name": "benchmarks/test_core.py::test_bulk_read",
            "value": 384.7840887598076,
            "unit": "iter/sec",
            "range": "stddev: 0.0000326208028675907",
            "extra": "mean: 2.5988600599964684 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.793979546360012,
            "unit": "iter/sec",
            "range": "stddev: 0.00010667302164607489",
            "extra": "mean: 102.1035417999883 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 148748.2094356543,
            "unit": "iter/sec",
            "range": "stddev: 0.000004342117264637875",
            "extra": "mean: 6.722770000351375 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 167.87348940071425,
            "unit": "iter/sec",
            "range": "stddev: 0.000054098510362425894",
            "extra": "mean: 5.956866707005766 msec\nrounds: 157"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 182.0536402237772,
            "unit": "iter/sec",
            "range": "stddev: 0.00003088347131090321",
            "extra": "mean: 5.492886595240926 msec\nrounds: 168"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 181.49808405925316,
            "unit": "iter/sec",
            "range": "stddev: 0.00005340238751862412",
            "extra": "mean: 5.509700034483741 msec\nrounds: 174"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1196.6093168067046,
            "unit": "iter/sec",
            "range": "stddev: 0.00001494057468571117",
            "extra": "mean: 835.694646493828 usec\nrounds: 1041"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 144.29453909222823,
            "unit": "iter/sec",
            "range": "stddev: 0.0002151745587482925",
            "extra": "mean: 6.930269200006478 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 7813.930062710107,
            "unit": "iter/sec",
            "range": "stddev: 0.000004945010763662501",
            "extra": "mean: 127.97657414061493 usec\nrounds: 5267"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 6408.542552969725,
            "unit": "iter/sec",
            "range": "stddev: 0.000005968343182384021",
            "extra": "mean: 156.0417195851495 usec\nrounds: 4044"
          },
          {
            "name": "benchmarks/test_fastapi.py::test_fastapi_baseline",
            "value": 144.69963019082562,
            "unit": "iter/sec",
            "range": "stddev: 0.00013516662295038313",
            "extra": "mean: 6.9108676966294205 msec\nrounds: 89"
          },
          {
            "name": "benchmarks/test_fastapi.py::test_fastapi_cached_hit",
            "value": 620.7294441939193,
            "unit": "iter/sec",
            "range": "stddev: 0.00011030414163930767",
            "extra": "mean: 1.611007838203329 msec\nrounds: 445"
          },
          {
            "name": "benchmarks/test_fastapi.py::test_fastapi_cached_miss",
            "value": 135.5636261098872,
            "unit": "iter/sec",
            "range": "stddev: 0.00031521097068193534",
            "extra": "mean: 7.3766100000113966 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 60.04381616556055,
            "unit": "iter/sec",
            "range": "stddev: 0.002334736737768134",
            "extra": "mean: 16.65450439130436 msec\nrounds: 46"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 110.59978422250227,
            "unit": "iter/sec",
            "range": "stddev: 0.0002292248507524806",
            "extra": "mean: 9.041608959997802 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 391814.39528879354,
            "unit": "iter/sec",
            "range": "stddev: 3.5710600282069615e-7",
            "extra": "mean: 2.5522288410637204 usec\nrounds: 70053"
          },
          {
            "name": "benchmarks/test_litestar.py::test_litestar_baseline",
            "value": 146.74596508825104,
            "unit": "iter/sec",
            "range": "stddev: 0.00010819800385208316",
            "extra": "mean: 6.814497416665688 msec\nrounds: 120"
          },
          {
            "name": "benchmarks/test_litestar.py::test_litestar_cached_hit",
            "value": 635.9842452758353,
            "unit": "iter/sec",
            "range": "stddev: 0.002032775405484176",
            "extra": "mean: 1.5723659940133987 msec\nrounds: 501"
          },
          {
            "name": "benchmarks/test_litestar.py::test_litestar_cached_miss",
            "value": 137.4689132954256,
            "unit": "iter/sec",
            "range": "stddev: 0.0003064617319331518",
            "extra": "mean: 7.274371900001597 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 384418.6251937836,
            "unit": "iter/sec",
            "range": "stddev: 3.8807406136716445e-7",
            "extra": "mean: 2.601330774480307 usec\nrounds: 120759"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 382730.4443752627,
            "unit": "iter/sec",
            "range": "stddev: 0.0000017021211481471513",
            "extra": "mean: 2.6128049510989824 usec\nrounds: 155643"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 384650.27824020345,
            "unit": "iter/sec",
            "range": "stddev: 3.7063196408898685e-7",
            "extra": "mean: 2.599764140494207 usec\nrounds: 121301"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 383390.6315184984,
            "unit": "iter/sec",
            "range": "stddev: 4.457365571391389e-7",
            "extra": "mean: 2.608305779510813 usec\nrounds: 93950"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 385406.8938747693,
            "unit": "iter/sec",
            "range": "stddev: 3.3813602596184997e-7",
            "extra": "mean: 2.594660385926909 usec\nrounds: 88153"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 125.26006180886328,
            "unit": "iter/sec",
            "range": "stddev: 0.0026361975928756777",
            "extra": "mean: 7.98339059999762 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 103.44598435503443,
            "unit": "iter/sec",
            "range": "stddev: 0.0002825678135243946",
            "extra": "mean: 9.666880800011768 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 61.76532767753215,
            "unit": "iter/sec",
            "range": "stddev: 0.0002555718012723687",
            "extra": "mean: 16.190313200002038 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 393316.2787975921,
            "unit": "iter/sec",
            "range": "stddev: 3.7137994284101937e-7",
            "extra": "mean: 2.542483120854041 usec\nrounds: 53883"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 683097.4371282663,
            "unit": "iter/sec",
            "range": "stddev: 4.897984868329644e-7",
            "extra": "mean: 1.4639199997645846 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 166176.17005406757,
            "unit": "iter/sec",
            "range": "stddev: 0.0000018803526280960397",
            "extra": "mean: 6.017709998218379 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 3877.9795233338496,
            "unit": "iter/sec",
            "range": "stddev: 0.000006818508006913869",
            "extra": "mean: 257.86624039219083 usec\nrounds: 3877"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 3789.129929809329,
            "unit": "iter/sec",
            "range": "stddev: 0.000016071634983044822",
            "extra": "mean: 263.91282920465085 usec\nrounds: 3835"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 2721.101480046115,
            "unit": "iter/sec",
            "range": "stddev: 0.000006790129382690628",
            "extra": "mean: 367.49823824396765 usec\nrounds: 2552"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2639.4332279732803,
            "unit": "iter/sec",
            "range": "stddev: 0.000018587313989067402",
            "extra": "mean: 378.8692168461718 usec\nrounds: 2315"
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
          "id": "d979867e1a0f915ce6cff5bdfbf60f973ce5c16d",
          "message": "Merge pull request #10 from albertobadia/dev\n\nNEXT RELEASE",
          "timestamp": "2026-02-25T19:42:48-03:00",
          "tree_id": "f1c8ba69460455860bb85c247904b16ebe763e81",
          "url": "https://github.com/albertobadia/zoocache/commit/d979867e1a0f915ce6cff5bdfbf60f973ce5c16d"
        },
        "date": 1772059475025,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 374960.07808114035,
            "unit": "iter/sec",
            "range": "stddev: 9.924142463941514e-7",
            "extra": "mean: 2.6669505860930682 usec\nrounds: 1963"
          },
          {
            "name": "benchmarks/test_core.py::test_bulk_read",
            "value": 394.5175910305447,
            "unit": "iter/sec",
            "range": "stddev: 0.00003177391407555241",
            "extra": "mean: 2.5347412199994324 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.782277091344376,
            "unit": "iter/sec",
            "range": "stddev: 0.00015461732134580518",
            "extra": "mean: 102.22568740000497 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 397596.9242546342,
            "unit": "iter/sec",
            "range": "stddev: 4.052910384960474e-7",
            "extra": "mean: 2.5151099995923687 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 166.66087736558828,
            "unit": "iter/sec",
            "range": "stddev: 0.00004127584061568371",
            "extra": "mean: 6.000208422078531 msec\nrounds: 154"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 180.14333623783884,
            "unit": "iter/sec",
            "range": "stddev: 0.000048882914246591285",
            "extra": "mean: 5.55113511764723 msec\nrounds: 170"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 179.93206511679082,
            "unit": "iter/sec",
            "range": "stddev: 0.000042843988096223626",
            "extra": "mean: 5.557653102858109 msec\nrounds: 175"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1045.3987868092868,
            "unit": "iter/sec",
            "range": "stddev: 0.000014383980475747734",
            "extra": "mean: 956.5727573227337 usec\nrounds: 956"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 146.06301102798318,
            "unit": "iter/sec",
            "range": "stddev: 0.00010574503567904319",
            "extra": "mean: 6.846360299996945 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6252.812779922678,
            "unit": "iter/sec",
            "range": "stddev: 0.000011029378810547753",
            "extra": "mean: 159.9280252258514 usec\nrounds: 4876"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5180.398578059438,
            "unit": "iter/sec",
            "range": "stddev: 0.00001108212242559928",
            "extra": "mean: 193.03533983568443 usec\nrounds: 4255"
          },
          {
            "name": "benchmarks/test_fastapi.py::test_fastapi_baseline",
            "value": 147.7038506398869,
            "unit": "iter/sec",
            "range": "stddev: 0.00009234700666596925",
            "extra": "mean: 6.770304197675085 msec\nrounds: 86"
          },
          {
            "name": "benchmarks/test_fastapi.py::test_fastapi_cached_hit",
            "value": 559.2714917345468,
            "unit": "iter/sec",
            "range": "stddev: 0.00011035620403285082",
            "extra": "mean: 1.788040361039252 msec\nrounds: 385"
          },
          {
            "name": "benchmarks/test_fastapi.py::test_fastapi_cached_miss",
            "value": 139.1789436064656,
            "unit": "iter/sec",
            "range": "stddev: 0.00035537567292556315",
            "extra": "mean: 7.184994900001129 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 521.5336090876297,
            "unit": "iter/sec",
            "range": "stddev: 0.000020898121572830218",
            "extra": "mean: 1.9174219696970232 msec\nrounds: 66"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 622.1533915950354,
            "unit": "iter/sec",
            "range": "stddev: 0.0010629435072068171",
            "extra": "mean: 1.6073206600003687 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 395167.61512172257,
            "unit": "iter/sec",
            "range": "stddev: 6.588039682227736e-7",
            "extra": "mean: 2.530571741543072 usec\nrounds: 89920"
          },
          {
            "name": "benchmarks/test_litestar.py::test_litestar_baseline",
            "value": 149.5645889110187,
            "unit": "iter/sec",
            "range": "stddev: 0.00007743213031425566",
            "extra": "mean: 6.686074606837154 msec\nrounds: 117"
          },
          {
            "name": "benchmarks/test_litestar.py::test_litestar_cached_hit",
            "value": 553.7585991247012,
            "unit": "iter/sec",
            "range": "stddev: 0.0017010068442306191",
            "extra": "mean: 1.8058410317792817 msec\nrounds: 472"
          },
          {
            "name": "benchmarks/test_litestar.py::test_litestar_cached_miss",
            "value": 140.9653714617107,
            "unit": "iter/sec",
            "range": "stddev: 0.00030158098691428285",
            "extra": "mean: 7.093940800004361 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 405067.446209321,
            "unit": "iter/sec",
            "range": "stddev: 5.049087660351035e-7",
            "extra": "mean: 2.4687246762437782 usec\nrounds: 132909"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 400608.12935672613,
            "unit": "iter/sec",
            "range": "stddev: 4.830458039458614e-7",
            "extra": "mean: 2.496204961206712 usec\nrounds: 128800"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 386339.33258063486,
            "unit": "iter/sec",
            "range": "stddev: 8.839738196204932e-7",
            "extra": "mean: 2.588398114476954 usec\nrounds: 135245"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 387789.1242117502,
            "unit": "iter/sec",
            "range": "stddev: 7.53940229338456e-7",
            "extra": "mean: 2.5787211078512744 usec\nrounds: 120846"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 386763.3477523159,
            "unit": "iter/sec",
            "range": "stddev: 5.553021528563326e-7",
            "extra": "mean: 2.585560410032447 usec\nrounds: 110048"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 134.53874306816016,
            "unit": "iter/sec",
            "range": "stddev: 0.0015370939257228114",
            "extra": "mean: 7.432803199992577 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 88.27647613228285,
            "unit": "iter/sec",
            "range": "stddev: 0.0011535818087479272",
            "extra": "mean: 11.328046200003428 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 52.78293818969513,
            "unit": "iter/sec",
            "range": "stddev: 0.00024679278058725783",
            "extra": "mean: 18.94551600000227 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 408065.79236713494,
            "unit": "iter/sec",
            "range": "stddev: 5.293359961179306e-7",
            "extra": "mean: 2.450585221072156 usec\nrounds: 154991"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 719414.1088688192,
            "unit": "iter/sec",
            "range": "stddev: 5.490600037350516e-7",
            "extra": "mean: 1.3900200005423358 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 211217.77603220742,
            "unit": "iter/sec",
            "range": "stddev: 0.0000015598219874503595",
            "extra": "mean: 4.734450001251389 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4171.408357451067,
            "unit": "iter/sec",
            "range": "stddev: 0.000011753774636430432",
            "extra": "mean: 239.7271890712346 usec\nrounds: 3898"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4115.066566251197,
            "unit": "iter/sec",
            "range": "stddev: 0.000010344026488149064",
            "extra": "mean: 243.00943469572945 usec\nrounds: 3499"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 2650.099447674258,
            "unit": "iter/sec",
            "range": "stddev: 0.00003580334565398945",
            "extra": "mean: 377.34432980528544 usec\nrounds: 2362"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2547.8814907681335,
            "unit": "iter/sec",
            "range": "stddev: 0.000014564440307504548",
            "extra": "mean: 392.48293283001976 usec\nrounds: 2516"
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
          "id": "56dd29ba395d3f152797ecc83cb595c7771f0043",
          "message": "FIX: Github benches svg links",
          "timestamp": "2026-02-25T19:52:42-03:00",
          "tree_id": "e47a5486ab12e1adf7e41a5797d14c6340cceffa",
          "url": "https://github.com/albertobadia/zoocache/commit/56dd29ba395d3f152797ecc83cb595c7771f0043"
        },
        "date": 1772060076790,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 365873.89904966345,
            "unit": "iter/sec",
            "range": "stddev: 0.0000010464828876403702",
            "extra": "mean: 2.733182122576775 usec\nrounds: 2092"
          },
          {
            "name": "benchmarks/test_core.py::test_bulk_read",
            "value": 386.32288421613487,
            "unit": "iter/sec",
            "range": "stddev: 0.00003573628025864232",
            "extra": "mean: 2.588508320000358 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.789682226288827,
            "unit": "iter/sec",
            "range": "stddev: 0.0002053962250843092",
            "extra": "mean: 102.1483615999955 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 372921.42929225124,
            "unit": "iter/sec",
            "range": "stddev: 4.0414852376737005e-7",
            "extra": "mean: 2.681529999222221 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 167.01223195591115,
            "unit": "iter/sec",
            "range": "stddev: 0.00004677956492719883",
            "extra": "mean: 5.987585389937102 msec\nrounds: 159"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 180.5318400954601,
            "unit": "iter/sec",
            "range": "stddev: 0.00003911663401370308",
            "extra": "mean: 5.539189095237873 msec\nrounds: 168"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 179.8697179171305,
            "unit": "iter/sec",
            "range": "stddev: 0.00004799385134056295",
            "extra": "mean: 5.559579519998579 msec\nrounds: 175"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1024.8587217742706,
            "unit": "iter/sec",
            "range": "stddev: 0.000014716825945553109",
            "extra": "mean: 975.7442452836482 usec\nrounds: 954"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 145.46666944023903,
            "unit": "iter/sec",
            "range": "stddev: 0.00009569152346853924",
            "extra": "mean: 6.874426999999628 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6250.897965408994,
            "unit": "iter/sec",
            "range": "stddev: 0.000008740680033946561",
            "extra": "mean: 159.9770153878316 usec\nrounds: 4874"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5200.861686644424,
            "unit": "iter/sec",
            "range": "stddev: 0.000009736848794765901",
            "extra": "mean: 192.27583047785225 usec\nrounds: 3911"
          },
          {
            "name": "benchmarks/test_fastapi.py::test_fastapi_baseline",
            "value": 148.64447997678403,
            "unit": "iter/sec",
            "range": "stddev: 0.0000865310221456788",
            "extra": "mean: 6.727461390804318 msec\nrounds: 87"
          },
          {
            "name": "benchmarks/test_fastapi.py::test_fastapi_cached_hit",
            "value": 566.3198088796837,
            "unit": "iter/sec",
            "range": "stddev: 0.0000960155726114723",
            "extra": "mean: 1.76578672389765 msec\nrounds: 431"
          },
          {
            "name": "benchmarks/test_fastapi.py::test_fastapi_cached_miss",
            "value": 140.2417523790509,
            "unit": "iter/sec",
            "range": "stddev: 0.00029569603614989",
            "extra": "mean: 7.13054409999927 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 517.2739545241965,
            "unit": "iter/sec",
            "range": "stddev: 0.00006056951258920792",
            "extra": "mean: 1.9332115820906328 msec\nrounds: 67"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 714.2610722783827,
            "unit": "iter/sec",
            "range": "stddev: 0.0011152863910875693",
            "extra": "mean: 1.4000483000006625 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 387303.57125075336,
            "unit": "iter/sec",
            "range": "stddev: 6.807760451347708e-7",
            "extra": "mean: 2.5819539870768873 usec\nrounds: 106079"
          },
          {
            "name": "benchmarks/test_litestar.py::test_litestar_baseline",
            "value": 149.695862852529,
            "unit": "iter/sec",
            "range": "stddev: 0.00008486598727327331",
            "extra": "mean: 6.680211336135171 msec\nrounds: 119"
          },
          {
            "name": "benchmarks/test_litestar.py::test_litestar_cached_hit",
            "value": 551.8410846276909,
            "unit": "iter/sec",
            "range": "stddev: 0.0017105240425224824",
            "extra": "mean: 1.8121158932460915 msec\nrounds: 459"
          },
          {
            "name": "benchmarks/test_litestar.py::test_litestar_cached_miss",
            "value": 140.60213567614375,
            "unit": "iter/sec",
            "range": "stddev: 0.000297165820548609",
            "extra": "mean: 7.112267499999803 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 401368.2578214267,
            "unit": "iter/sec",
            "range": "stddev: 4.5229372257757587e-7",
            "extra": "mean: 2.4914775409193206 usec\nrounds: 119818"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 398906.530552945,
            "unit": "iter/sec",
            "range": "stddev: 5.058016430193683e-7",
            "extra": "mean: 2.5068529176843715 usec\nrounds: 145286"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 385307.3669611053,
            "unit": "iter/sec",
            "range": "stddev: 7.532446907010069e-7",
            "extra": "mean: 2.595330600312515 usec\nrounds: 129283"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 387559.11612919415,
            "unit": "iter/sec",
            "range": "stddev: 7.579251156828627e-7",
            "extra": "mean: 2.5802515239162807 usec\nrounds: 100726"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 386884.3593507178,
            "unit": "iter/sec",
            "range": "stddev: 6.424015442861938e-7",
            "extra": "mean: 2.5847516856929373 usec\nrounds: 119389"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 138.65689664290068,
            "unit": "iter/sec",
            "range": "stddev: 0.0014342080720414678",
            "extra": "mean: 7.2120466000001215 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 87.1980284316585,
            "unit": "iter/sec",
            "range": "stddev: 0.001559352585168549",
            "extra": "mean: 11.468149199998834 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 54.3965091888791,
            "unit": "iter/sec",
            "range": "stddev: 0.00017419520537701204",
            "extra": "mean: 18.383532600000763 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 403933.0210703424,
            "unit": "iter/sec",
            "range": "stddev: 4.6959635602079734e-7",
            "extra": "mean: 2.4756579626745996 usec\nrounds: 147864"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 692276.2741061578,
            "unit": "iter/sec",
            "range": "stddev: 6.128385283744624e-7",
            "extra": "mean: 1.4445099989757182 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 208129.5398196915,
            "unit": "iter/sec",
            "range": "stddev: 0.0000021213486360391564",
            "extra": "mean: 4.804700000136108 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 4091.3549589937666,
            "unit": "iter/sec",
            "range": "stddev: 0.000012777128334438096",
            "extra": "mean: 244.41780535364285 usec\nrounds: 3848"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 4027.967001334981,
            "unit": "iter/sec",
            "range": "stddev: 0.000007929325023223011",
            "extra": "mean: 248.26419870584144 usec\nrounds: 3709"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 2603.2419691824557,
            "unit": "iter/sec",
            "range": "stddev: 0.000011577483661855333",
            "extra": "mean: 384.136400625889 usec\nrounds: 2556"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2511.9052004326227,
            "unit": "iter/sec",
            "range": "stddev: 0.000010096772712181925",
            "extra": "mean: 398.10419590188803 usec\nrounds: 2440"
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
          "id": "47b12b0b1718dfaeeb63e52f5efadfe19c32cf18",
          "message": "UPDATE: Docs",
          "timestamp": "2026-02-26T03:01:19-03:00",
          "tree_id": "d235cd991b97e8a2c3978e3eaa000e7be9926553",
          "url": "https://github.com/albertobadia/zoocache/commit/47b12b0b1718dfaeeb63e52f5efadfe19c32cf18"
        },
        "date": 1772085801268,
        "tool": "pytest",
        "benches": [
          {
            "name": "benchmarks/test_core.py::test_hit_latency",
            "value": 359923.27091288427,
            "unit": "iter/sec",
            "range": "stddev: 0.0000011053334504312408",
            "extra": "mean: 2.778369949416357 usec\nrounds: 1584"
          },
          {
            "name": "benchmarks/test_core.py::test_bulk_read",
            "value": 376.625829680409,
            "unit": "iter/sec",
            "range": "stddev: 0.00010229491599478109",
            "extra": "mean: 2.655155119999506 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_core.py::test_thundering_herd",
            "value": 9.746182394041458,
            "unit": "iter/sec",
            "range": "stddev: 0.00014665738247540962",
            "extra": "mean: 102.60427720000109 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_core.py::test_invalidation_efficiency_prefix",
            "value": 378621.5147324836,
            "unit": "iter/sec",
            "range": "stddev: 5.374200379420542e-7",
            "extra": "mean: 2.6411600003939384 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_baseline",
            "value": 166.40066339715682,
            "unit": "iter/sec",
            "range": "stddev: 0.00004266863581423446",
            "extra": "mean: 6.0095914258060965 msec\nrounds: 155"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_count_baseline",
            "value": 179.76421855984935,
            "unit": "iter/sec",
            "range": "stddev: 0.00004565653900805118",
            "extra": "mean: 5.562842305389419 msec\nrounds: 167"
          },
          {
            "name": "benchmarks/test_django.py::test_django_manager_join_baseline",
            "value": 178.94906233144908,
            "unit": "iter/sec",
            "range": "stddev: 0.000050390551138972605",
            "extra": "mean: 5.588182396551495 msec\nrounds: 174"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_hit",
            "value": 1041.012411375813,
            "unit": "iter/sec",
            "range": "stddev: 0.000021822245801084455",
            "extra": "mean: 960.6033406252952 usec\nrounds: 960"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_miss",
            "value": 145.70812846349372,
            "unit": "iter/sec",
            "range": "stddev: 0.00007065108658219164",
            "extra": "mean: 6.8630350999981715 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_django.py::test_django_cached_count_hit",
            "value": 6199.682577880269,
            "unit": "iter/sec",
            "range": "stddev: 0.000009904009802787412",
            "extra": "mean: 161.29858060280074 usec\nrounds: 4578"
          },
          {
            "name": "benchmarks/test_django.py::test_django_complex_join_hit",
            "value": 5091.011217960373,
            "unit": "iter/sec",
            "range": "stddev: 0.000012466111191962736",
            "extra": "mean: 196.424631018714 usec\nrounds: 4133"
          },
          {
            "name": "benchmarks/test_fastapi.py::test_fastapi_baseline",
            "value": 143.5379578657221,
            "unit": "iter/sec",
            "range": "stddev: 0.00040739150876264535",
            "extra": "mean: 6.9667982941173445 msec\nrounds: 85"
          },
          {
            "name": "benchmarks/test_fastapi.py::test_fastapi_cached_hit",
            "value": 546.2158497560429,
            "unit": "iter/sec",
            "range": "stddev: 0.00011682007886099103",
            "extra": "mean: 1.8307780714284132 msec\nrounds: 364"
          },
          {
            "name": "benchmarks/test_fastapi.py::test_fastapi_cached_miss",
            "value": 134.98554196856196,
            "unit": "iter/sec",
            "range": "stddev: 0.0003801488316965135",
            "extra": "mean: 7.408200800000486 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_lifecycle",
            "value": 510.85891507180867,
            "unit": "iter/sec",
            "range": "stddev: 0.00010072974609846307",
            "extra": "mean: 1.9574876164379658 msec\nrounds: 73"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_recovery",
            "value": 619.7757628981338,
            "unit": "iter/sec",
            "range": "stddev: 0.0010531015427223383",
            "extra": "mean: 1.613486779999107 msec\nrounds: 50"
          },
          {
            "name": "benchmarks/test_lazy.py::test_lazy_update_baseline",
            "value": 378751.04591213726,
            "unit": "iter/sec",
            "range": "stddev: 7.042447481850395e-7",
            "extra": "mean: 2.6402567353754063 usec\nrounds: 89119"
          },
          {
            "name": "benchmarks/test_litestar.py::test_litestar_baseline",
            "value": 145.9082557688629,
            "unit": "iter/sec",
            "range": "stddev: 0.00010414990145260422",
            "extra": "mean: 6.853621782609247 msec\nrounds: 115"
          },
          {
            "name": "benchmarks/test_litestar.py::test_litestar_cached_hit",
            "value": 514.417102814483,
            "unit": "iter/sec",
            "range": "stddev: 0.0023876083838445935",
            "extra": "mean: 1.9439478091392992 msec\nrounds: 372"
          },
          {
            "name": "benchmarks/test_litestar.py::test_litestar_cached_miss",
            "value": 135.97747331899626,
            "unit": "iter/sec",
            "range": "stddev: 0.00036726371559267826",
            "extra": "mean: 7.354159300004426 msec\nrounds: 10"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10]",
            "value": 389878.8672607685,
            "unit": "iter/sec",
            "range": "stddev: 4.976277774343832e-7",
            "extra": "mean: 2.564899213506628 usec\nrounds: 113418"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[100]",
            "value": 386237.1817776433,
            "unit": "iter/sec",
            "range": "stddev: 7.013550416531737e-7",
            "extra": "mean: 2.5890826859225062 usec\nrounds: 146349"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[1000]",
            "value": 376849.83762360463,
            "unit": "iter/sec",
            "range": "stddev: 0.0000014288966036781833",
            "extra": "mean: 2.6535768366146786 usec\nrounds: 123229"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[5000]",
            "value": 377621.3879485436,
            "unit": "iter/sec",
            "range": "stddev: 7.608867540070177e-7",
            "extra": "mean: 2.648155088440765 usec\nrounds: 113935"
          },
          {
            "name": "benchmarks/test_load.py::test_massive_dependencies_get[10000]",
            "value": 376413.39268117695,
            "unit": "iter/sec",
            "range": "stddev: 5.790955231282137e-7",
            "extra": "mean: 2.6566536139350454 usec\nrounds: 113948"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[50]",
            "value": 130.89351657968973,
            "unit": "iter/sec",
            "range": "stddev: 0.0014463024962311105",
            "extra": "mean: 7.639797800001702 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[100]",
            "value": 88.22422872349529,
            "unit": "iter/sec",
            "range": "stddev: 0.0001170853686146165",
            "extra": "mean: 11.334754800000724 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_high_concurrency_throughput[200]",
            "value": 50.27801530229421,
            "unit": "iter/sec",
            "range": "stddev: 0.00015363925601735473",
            "extra": "mean: 19.889408800000297 msec\nrounds: 5"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_validation",
            "value": 390138.7079322799,
            "unit": "iter/sec",
            "range": "stddev: 5.641017861459525e-7",
            "extra": "mean: 2.5631909361159306 usec\nrounds: 114719"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_root",
            "value": 599078.6167996873,
            "unit": "iter/sec",
            "range": "stddev: 0.000002751746162250397",
            "extra": "mean: 1.6692300008003258 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_load.py::test_deep_hierarchy_invalidation_leaf",
            "value": 197507.84597617033,
            "unit": "iter/sec",
            "range": "stddev: 0.000002984477184667107",
            "extra": "mean: 5.063090000589909 usec\nrounds: 100"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_baseline",
            "value": 3999.5952418241736,
            "unit": "iter/sec",
            "range": "stddev: 0.000007807808871173607",
            "extra": "mean: 250.02529994607917 usec\nrounds: 3704"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_memory_tti",
            "value": 3954.8332959183963,
            "unit": "iter/sec",
            "range": "stddev: 0.0000067064681824508325",
            "extra": "mean: 252.85515853021025 usec\nrounds: 3564"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_baseline",
            "value": 2558.508243799614,
            "unit": "iter/sec",
            "range": "stddev: 0.000015802756270784185",
            "extra": "mean: 390.8527566496758 usec\nrounds: 2519"
          },
          {
            "name": "benchmarks/test_storage.py::test_storage_lmdb_tti",
            "value": 2474.780555756933,
            "unit": "iter/sec",
            "range": "stddev: 0.000024059451691212544",
            "extra": "mean: 404.07623119300825 usec\nrounds: 2180"
          }
        ]
      }
    ]
  }
}