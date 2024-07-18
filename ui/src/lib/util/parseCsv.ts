  export type Row = {
    cells: string[];
  }
  
  export type CSV = {
    header: string[];
    rows: Row[];
  }
  
  export const parseCSV = (csvString: string) : CSV => {
    // Split the input string by new lines to get the rows
    const lines = csvString.trim().split('\n')
    
    // Extract the header row (first row)
    const header = lines[0].split(',')
  
    // Extract the data rows
    const rows = lines.slice(1).map(line => ({
      cells: line.split(',')
    }))
  
    // Return the parsed CSV object
    return {
      header,
      rows
    }
  }
  