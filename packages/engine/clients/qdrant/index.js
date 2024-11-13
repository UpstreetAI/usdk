import { body_request, url_request } from "./request.js";

const base_url = "http://localhost:6333/";

const QdrantResponse = function(response) {
	this.err = response[0];
	this.response = response[1];
}

export const Qdrant = function(url){
	this.url = url||base_url;
};

//DELETE http://localhost:6333/collections/{collection_name}
Qdrant.prototype.delete_collection = async function (name) {
	let qdrant_url = this.url;
	let url = `${qdrant_url}collections/${name}`;
	return new QdrantResponse(await body_request(url,null,'DELETE'));
}

//PUT http://localhost:6333/collections/{collection_name}
Qdrant.prototype.create_collection = async function (name,body) {
	let qdrant_url = this.url;
	let url = `${qdrant_url}collections/${name}`;
	return new QdrantResponse(await body_request(url,body,'PUT'));
}

//GET http://localhost:6333/collections/{collection_name}
Qdrant.prototype.get_collection = async function (name) {
	let qdrant_url = this.url;
	let url = `${qdrant_url}collections/${name}`;
	return new QdrantResponse(await url_request(url));
}


//PUT http://localhost:6333/collections/{collection_name}/points
Qdrant.prototype.upload_points = async function (name,points) {
	let qdrant_url = this.url;
	let url = `${qdrant_url}collections/${name}/points`;	
	return new QdrantResponse(await body_request(url,{points:points},'PUT'));
}

Qdrant.prototype.delete_points = async function (name,points) {
	let qdrant_url = this.url;
	let url = `${qdrant_url}collections/${name}/points/delete`;	
	return new QdrantResponse(await body_request(url,{points:points},'POST'));
}

//POST http://localhost:6333/collections/{collection_name}/points/search
Qdrant.prototype.search_collection = async function (name,vector,k,ef,filter) {
	k = k || 5;
	ef = ef || 128;
	let qdrant_url = this.url;
	let url = `${qdrant_url}collections/${name}/points/search`;
	let query = {
		"params": {
			"hnsw_ef": ef
		},
		"vector": vector,
		"top": k
	};
	if (filter) query.filter = filter;
	return new QdrantResponse(await body_request(url,query,'POST'));
}


//Same as search_collection but allows free-form query by the client
Qdrant.prototype.query_collection = async function (name,query) {
	let qdrant_url = this.url;
	let url = `${qdrant_url}collections/${name}/points/search`;
	return new QdrantResponse(await body_request(url,query,'POST'));
}

//Get the specific points by ids
Qdrant.prototype.retrieve_points = async function (name,query) {
	let qdrant_url = this.url;
	let url = `${qdrant_url}collections/${name}/points`;
	return new QdrantResponse(await body_request(url,query,'POST'));
}
