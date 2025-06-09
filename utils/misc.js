let orderColourMap = {
  'pending' : 'red-500',
  'preparing' : 'yellow-500',
  'served' : 'teal-500',
  'billed' : 'green-500',
  'paid': 'green-500'
}


function paginate(arr,req) {
  const pageSize = 8
  const pageNo = Math.min(req.query.page ? parseInt(req.query.page) : 0 , Math.ceil(arr.length / pageSize) - 1);
  return {
    filtered:arr.slice(pageSize*pageNo, pageSize+(pageSize*pageNo)),
    total: Math.ceil(arr.length / pageSize),
    current: pageNo+1
  };
}

export {orderColourMap,paginate};

//TODO: ADD FILTERING FOR ITEMS
//TODO: TEST AND FIX REFRESH TOKEN