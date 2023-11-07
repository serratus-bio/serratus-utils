# serratus-utils

A collection of _simple_ and _self-contained_ utilities that could be of interest for anyone working with the serratus platform.

* **simple**, meaning that all the tools in here should do a single, concrete thing well and do that one thing only (following the UNIX philosophy); in a single source file, that is meant to be executed with a simple command line call
* **self-contained**, meaning that anything needed to run each of these scripts should be present in this repository

If your script is not _simple_ (i.e. requires more than one file or is expected to grow in functionality in the future) it most likely deserves a dedicated repository in [serratus-bio](https://github.com/serratus-bio).

All scripts should implement a `--help` argument to print out detailed usage information with all the arguments it accepts and an explanation of what they do.

All scripts should exit with a `0` status code if nothing goes wrong, otherwise they should return a `non-zero` status code. Main output should go to `stdout`, while warnings and errors should go to `stderr`. Furthermore, design these scripts while keeping in mind that they could (and should) be used in a larger pipeline on a UNIX-like environment.

# Contents

For each of the scripts listed below, a small sentence about what it does, a one-line sample usage with the most common use case as well as sample output from it should be provided.

### SRA/*

Scripts that extract info from SRA or its related projects (like STAT). So far, we only have one script that uses node to run, so make sure you `cd` into this directory and run `npm install` to make sure it's good to go.

### SRA/stat-query-by-sra-id.js

Returns all [SRA/STAT](https://www.ncbi.nlm.nih.gov/sra/docs/sra-taxonomy-analysis-tool/) taxonomy information found for a specific SRA run id.

**Example**
`node stat-query-by-sra-id.js --depth=2 ERR2756788`

Queries SRA/STAT for matches found on "Frank the Bat" (SRA ID: ERR2756788).
Remove the `--depth` argument to print out the full hierarchy of hits.
The output corresponds to the same data found on the "Analysis" tab on [the NCBI Trace page for this entry](https://trace.ncbi.nlm.nih.gov/Traces/?view=run_browser&acc=ERR2756788&display=analysis).


**Output**
```
STAT FOR SRA ID: ERR2756788
IDENTIFIED                      UNIDENTIFIED                    TOTAL
8,244,850  46.42%               9,515,859  53.58%               17,760,709  100.00%

cellular organisms [131567]   8,242,597  46.41%
  Eukaryota [2759]   6,242,055  35.15%
    Opisthokonta [33154]   6,224,366  35.05%
    Viridiplantae [33090]   1,544  <0.01%
    Amoebozoa [554915]   23  <0.01%
    Euglenozoa [33682]   11  <0.01%
    Alveolata [33630]   2  <0.01%
  Bacteria [2]   1,989,553  11.20%
    Proteobacteria [1224]   1,119,286  6.30%
    Terrabacteria group [1783272]   623,179  3.51%
    FCB group [1783270]   4,656  <0.01%
    PVC group [1783257]   4,458  <0.01%
    ...
```
