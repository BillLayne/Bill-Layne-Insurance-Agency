// Only expiring HMAC challenges and hashed rate-limit keys are stored in D1.
export async function permit(db,key,max,seconds,now){
 const expires=now+seconds;
 const row=await db.prepare('INSERT INTO toolkit_limits(key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires<=? THEN 1 ELSE count+1 END,expires=CASE WHEN expires<=? THEN ? ELSE expires END WHERE expires<=? OR count<? RETURNING count').bind(key,expires,now,now,expires,now,max).first();
 return !!row;
}
export async function issue(db,id,emailHash,codeHash,now){
 await db.batch([
  db.prepare('DELETE FROM toolkit_limits WHERE expires<=?').bind(now),
  db.prepare('DELETE FROM toolkit_challenges WHERE email_hash=? OR expires<=?').bind(emailHash,now),
  db.prepare('INSERT INTO toolkit_challenges(id,email_hash,code_hash,expires,attempts) VALUES (?,?,?,?,0)').bind(id,emailHash,codeHash,now+600)
 ]);
}
export async function consume(db,id,emailHash,codeHash,now,equal){
 const row=await db.prepare('UPDATE toolkit_challenges SET attempts=attempts+1 WHERE id=? AND email_hash=? AND expires>? AND attempts<5 RETURNING code_hash').bind(id,emailHash,now).first();
 if(!row||!equal(row.code_hash,codeHash))return false;
 return !!await db.prepare('DELETE FROM toolkit_challenges WHERE id=? AND email_hash=? AND code_hash=? AND expires>? RETURNING id').bind(id,emailHash,codeHash,now).first();
}
