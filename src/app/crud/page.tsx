'use client';
import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

interface Field { key: string; value: string; }

const apiCall = async (endpoint: string, body: any): Promise<any> => {
  console.log(`API Call to ${endpoint} with body:`, body);
  await new Promise(resolve => setTimeout(resolve, 500));
  if (endpoint === '/api/list-collections') return { collections: ['users', 'posts', 'defaultCollection'] };
  if (endpoint === '/api/read-data') return { results: [{ _id: 'dummy1', ...body.filter }, { _id: 'dummy2', ...body.filter }] };
  if (endpoint === '/api/list-data') return { results: [{ _id: 'all1', data: '...' }, { _id: 'all2', data: '...' }] };
  return { success: true, message: `${endpoint} simulated success`, ...body };
};

export default function CrudPage() {
  const { address, isConnected } = useAccount();

  const [collection, setCollection] = useState('defaultCollection');
  const [collectionsList, setCollectionsList] = useState<string[]>([]);

  const [createFields, setCreateFields] = useState<Field[]>([{ key: '', value: '' }]);
  const [createRes, setCreateRes] = useState<any>(null);

  const [filterFields, setFilterFields] = useState<Field[]>([{ key: '', value: '' }]);
  const [readRes, setReadRes] = useState<any[]>([]);

  const [updateQueryFields, setUpdateQueryFields] = useState<Field[]>([{ key: '', value: '' }]);
  const [updateDataFields, setUpdateDataFields] = useState<Field[]>([{ key: '', value: '' }]);
  const [updateRes, setUpdateRes] = useState<any>(null);

  const [deleteFields, setDeleteFields] = useState<Field[]>([{ key: '', value: '' }]);
  const [deleteRes, setDeleteRes] = useState<any>(null);
  const [deleteAllRes, setDeleteAllRes] = useState<any>(null);

  const [listData, setListData] = useState<any[]>([]);

  const fieldsToObject = (fields: Field[]) => {
    return fields.reduce((acc, field) => {
      if (field.key) {
        acc[field.key] = field.value;
      }
      return acc;
    }, {} as Record<string, string>);
  };

  const handleList = async () => {
    try {
      const res = await apiCall('/api/list-collections', {});
      setCollectionsList(res?.collections && Array.isArray(res.collections) ? res.collections : []);
    } catch (error) {
      console.error("Error listing collections:", error);
      setCollectionsList([]);
    }
  };

  const handleCreate = async () => {
    const data = fieldsToObject(createFields.filter(f => f.key));
    if (Object.keys(data).length === 0) return alert('Please provide data to create.');
    const res = await apiCall('/api/create-data', { collection, data });
    setCreateRes(res);
    setCreateFields([{ key: '', value: '' }]);
  };

  const handleRead = async () => {
    const filter = fieldsToObject(filterFields.filter(f => f.key)); 
    const res = await apiCall('/api/read-data', { collection, filter });
    setReadRes(res?.results && Array.isArray(res.results) ? res.results : []);
  };

  const handleUpdate = async () => {
    const query = fieldsToObject(updateQueryFields.filter(f => f.key));
    const data = fieldsToObject(updateDataFields.filter(f => f.key));
    if (Object.keys(query).length === 0) return alert('Please provide query fields to identify document(s).');
    if (Object.keys(data).length === 0) return alert('Please provide data fields to update.');
    const res = await apiCall('/api/update-data', { collection, query, data });
    setUpdateRes(res);
  };

  const handleDelete = async () => {
    const query = fieldsToObject(deleteFields.filter(f => f.key));
    if (Object.keys(query).length === 0) return alert('Please provide fields to identify document(s) for deletion.');
    const res = await apiCall('/api/delete-data', { collection, query });
    setDeleteRes(res);
  };

  const handleDeleteAll = async () => {
    if (!confirm(`Are you sure you want to delete ALL data in the "${collection}" collection?`)) return;
    const res = await apiCall('/api/delete-data', { collection, query: {} });
    setDeleteAllRes(res);
  };

  const handleListData = async () => {
    const res = await apiCall('/api/list-data', { collection });
    setListData(res?.results && Array.isArray(res.results) ? res.results : []);
  };

  return (
    <div className="p-8 space-y-8 text-black [&_button]:cursor-pointer">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">CRUD Demo</h1>
        <ConnectButton />
      </div>
      
      {isConnected && address === '0xB6bBdd7D3ce7D38243013e887bb756018324feC3' ? (
        <>
          <div>
            <label className="mr-2">Collection:</label>
            <input className="border px-2 py-1" value={collection} onChange={e => setCollection(e.target.value)} />
          </div>

          <section className="border p-4 rounded space-y-2">
            <h2 className="font-semibold">Collections</h2>
            <button className="bg-purple-500 text-white px-4 py-2 rounded" onClick={handleList}>List</button>
            <ul className="list-disc ml-5">
              {collectionsList.map(c => <li key={c}>{c}</li>)}
            </ul>
          </section>

          <section className="border p-4 rounded space-y-2">
            <h2 className="font-semibold">Create</h2>
            {createFields.map((f,i) => (
              <div key={i} className="flex space-x-2">
                <input type="text" placeholder="Key" className="border p-1 flex-1" value={f.key} onChange={e => {
                  const arr = [...createFields]; arr[i].key = e.target.value; setCreateFields(arr);
                }} />
                <input type="text" placeholder="Value" className="border p-1 flex-1" value={f.value} onChange={e => {
                  const arr = [...createFields]; arr[i].value = e.target.value; setCreateFields(arr);
                }} />
                <button className="text-red-500" onClick={() => setCreateFields(createFields.filter((_,idx) => idx!==i))}>Remove</button>
              </div>
            ))}
            <button onClick={() => setCreateFields([...createFields, {key:'',value:''}])} className="text-blue-500 block mb-2">+ Add Field</button>
            <button className="bg-blue-500 text-white px-4 py-2 rounded block" onClick={handleCreate}>Create</button>
            {createRes && <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(createRes, null, 2)}</pre>}
          </section>

          <section className="border p-4 rounded space-y-2">
            <h2 className="font-semibold">Read</h2>
            {filterFields.map((f,i) => (
              <div key={i} className="flex space-x-2">
                <input type="text" placeholder="Key" className="border p-1 flex-1" value={f.key} onChange={e => {
                  const arr = [...filterFields]; arr[i].key = e.target.value; setFilterFields(arr);
                }} />
                <input type="text" placeholder="Value" className="border p-1 flex-1" value={f.value} onChange={e => {
                  const arr = [...filterFields]; arr[i].value = e.target.value; setFilterFields(arr);
                }} />
                <button className="text-red-500" onClick={() => setFilterFields(filterFields.filter((_,idx) => idx!==i))}>Remove</button>
              </div>
            ))}
            <button onClick={() => setFilterFields([...filterFields, {key:'',value:''}])} className="text-green-500 block mb-2">+ Add Filter</button>
            <button className="bg-green-500 text-white px-4 py-2 rounded block" onClick={handleRead}>Read</button>
            <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(readRes, null, 2)}</pre>
          </section>

          <section className="border p-4 rounded space-y-2">
            <h2 className="font-semibold">Update</h2>
            {updateQueryFields.map((f,i) => (
              <div key={i} className="flex space-x-2">
                <input type="text" placeholder="Query Key" className="border p-1 flex-1" value={f.key} onChange={e => {
                  const arr = [...updateQueryFields]; arr[i].key = e.target.value; setUpdateQueryFields(arr);
                }} />
                <input type="text" placeholder="Query Value" className="border p-1 flex-1" value={f.value} onChange={e => {
                  const arr = [...updateQueryFields]; arr[i].value = e.target.value; setUpdateQueryFields(arr);
                }} />
                <button className="text-red-500" onClick={() => setUpdateQueryFields(updateQueryFields.filter((_,idx) => idx!==i))}>Remove</button>
              </div>
            ))}
            <button onClick={() => setUpdateQueryFields([...updateQueryFields, {key:'',value:''}])} className="text-yellow-500 block mb-2">+ Add Query Field</button>
            {updateDataFields.map((f,i) => (
              <div key={i} className="flex space-x-2">
                <input type="text" placeholder="Update Key" className="border p-1 flex-1" value={f.key} onChange={e => {
                  const arr = [...updateDataFields]; arr[i].key = e.target.value; setUpdateDataFields(arr);
                }} />
                <input type="text" placeholder="Update Value" className="border p-1 flex-1" value={f.value} onChange={e => {
                  const arr = [...updateDataFields]; arr[i].value = e.target.value; setUpdateDataFields(arr);
                }} />
                <button className="text-red-500" onClick={() => setUpdateDataFields(updateDataFields.filter((_,idx) => idx!==i))}>Remove</button>
              </div>
            ))}
            <button onClick={() => setUpdateDataFields([...updateDataFields, {key:'',value:''}])} className="text-yellow-500 block mb-2">+ Add Update Field</button>
            <button className="bg-yellow-500 text-white px-4 py-2 rounded block" onClick={handleUpdate}>Update</button>
            {updateRes && <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(updateRes, null, 2)}</pre>}
          </section>

          <section className="border p-4 rounded space-y-2">
            <h2 className="font-semibold">Delete</h2>
            {deleteFields.map((f,i) => (
              <div key={i} className="flex space-x-2">
                <input type="text" placeholder="Key" className="border p-1 flex-1" value={f.key} onChange={e => {
                  const arr = [...deleteFields]; arr[i].key = e.target.value; setDeleteFields(arr);
                }} />
                <input type="text" placeholder="Value" className="border p-1 flex-1" value={f.value} onChange={e => {
                  const arr = [...deleteFields]; arr[i].value = e.target.value; setDeleteFields(arr);
                }} />
                <button className="text-red-500" onClick={() => setDeleteFields(deleteFields.filter((_,idx) => idx!==i))}>Remove</button>
              </div>
            ))}
            <button onClick={() => setDeleteFields([...deleteFields, {key:'',value:''}])} className="text-red-500 block mb-2">+ Add Field</button>
            <button className="bg-red-500 text-white px-4 py-2 rounded block" onClick={handleDelete}>Delete</button>
            <button className="bg-red-700 text-white px-4 py-2 rounded block" onClick={handleDeleteAll}>Delete All Data</button>
            {deleteRes && <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(deleteRes, null, 2)}</pre>}
            {deleteAllRes && <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(deleteAllRes, null, 2)}</pre>}
          </section>

          <section className="border p-4 rounded space-y-2">
            <h2 className="font-semibold">List All Data</h2>
            <button className="bg-indigo-500 text-white px-4 py-2 rounded" onClick={handleListData}>List Data</button>
            <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(listData, null, 2)}</pre>
          </section>
        </>
      ) : isConnected ? (
         <div className="text-red-500 font-semibold">Connected address does not match the required address.</div>
      ) : null}
    </div>
  );
}
