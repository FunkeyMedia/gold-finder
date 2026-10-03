const rejectedAsins=new Set(['B0GWH56JP7','B0GWHT8Z6J']); // Conflicting declared fine weights require manual correction.
// Also apply this check to cached records.
export function isBullionListing(title:string,features:string[]=[],asin=''){
 if(rejectedAsins.has(asin))return false;
 if(/papiergold|paper\s*gold|paper\s*bars?|papierkunst|acryl|barren\s*kapseln|empty\s*(?:case|capsule)|mcvitie|biscuit|chocolat|schokolade|gold\s*plated|vergoldet|replica|replik/i.test(title))return false;
 return !/(?:mit|with).{0,30}(?:feingold|gold).{0,45}(?:veredelt|beschichtet)|gold[- ]plated|vergoldet/i.test(features.join(' '));
}
