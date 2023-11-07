import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));

if(argv._.length < 1 || argv.help) {
  console.log('stat-query-by-sra-id.js');
  console.log('  usage:');
  console.log('    node stat-query-by-sra-id.js [SRA_ID] [... arguments]');
  console.log('  arguments:');
  console.log('    --depth: stop at n levels in the tax hierarchy');
  console.log('             if not specified, prints everything');
  console.log('             0 prints only the major taaxonomy groups');
  console.log('             1 roughly corresponds to domains');
  console.log('             2 roughly corresponds to phylums');
  console.log('             n and so on ...');
  console.log('    --json: returns the raw json data from the NCBI STAT frontend');
  console.log('    --min-reads: prints only the nodes with at least n reads');
  console.log('    --min-percentage: prints only the nodes that make up at least');
  console.log('                      (n*100)% of the total number of identified reads');
}

if(argv._.length < 1) {
  console.error('ERROR: Missing SRA ID');

  process.exit(1);
}

const SRA_ID = argv._[0];

const response = await fetch('https://trace.ncbi.nlm.nih.gov/Traces/sra-db-be/run_taxonomy?acc=' + SRA_ID + '&cluster_name=public');

if(response.status !== 200) {
  console.error('ERROR: SRA ID not found or NCBI frontend service not available');

  process.exit(1);
}

const [json] = await response.json();

if(argv.json) {
  console.log(json);

  process.exit(0);
}

const taxTableIndex = json.tax_table.reduce((a, b, c) => Object.assign(a, { [b.tax_id]:c }), {});
json.tax_table
  .forEach(v => {
    if(v.parent && taxTableIndex[v.parent] !== undefined) {
      const index = taxTableIndex[v.parent];

      if(!json.tax_table[index].childNodes)
        json.tax_table[index].childNodes = [];

      json.tax_table[index].childNodes.push(v.tax_id);
    }
  });

const unitToPercentageString = n => {
  return n < 0.01 ? '<0.01%' : (n*100).toFixed(2) + '%';
};

console.log('STAT FOR SRA ID: ' + SRA_ID);
console.log('IDENTIFIED'.padEnd(32, ' ') + 'UNIDENTIFIED'.padEnd(32, ' ') + 'TOTAL');
console.log(
    (json.tax_totals.identified.toLocaleString() + '  ' + unitToPercentageString(json.tax_totals.identified/json.tax_totals.total)).padEnd(32, ' ')
  + ((json.tax_totals.total-json.tax_totals.identified).toLocaleString() + '  ' + unitToPercentageString((json.tax_totals.total-json.tax_totals.identified)/json.tax_totals.total)).padEnd(32, ' ')
  + (json.tax_totals.total.toLocaleString() + '  ' + unitToPercentageString(json.tax_totals.total/json.tax_totals.total))
);

const taxTablePrint = args => {
  if(argv.depth !== undefined && (args.depth||0) > argv.depth)
    return;
  if(argv['min-percentage'] && (args.node.total_count/json.tax_totals.total) < argv['min-percentage'])
    return;
  if(argv['min-reads'] && args.node.total_count < argv['min-reads'])
    return;

  console.log(' '.repeat((args.depth||0)*2) + args.node.org + ' [' + args.node.tax_id + '] ' + '  ' + args.node.total_count.toLocaleString() + '  ' + unitToPercentageString(args.node.total_count/json.tax_totals.total));

  if(args.node.childNodes) {
    args.node.childNodes = args.node.childNodes.sort((a, b) => json.tax_table[taxTableIndex[b]].total_count-json.tax_table[taxTableIndex[a]].total_count);

    args.node.childNodes.forEach(v => taxTablePrint({ depth:(args.depth||0)+1, node:json.tax_table[taxTableIndex[v]] }));
  }
};

console.log();
for(const root of json.tax_table.filter(v => !v.parent))
  taxTablePrint({ node:root });
