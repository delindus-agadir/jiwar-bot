# 🔧 Configuration de la validation admin

## Étape 1 : Ajouter le champ `approved` à la collection `users`

1. Allez dans **Appwrite Console** → **Databases** → Votre base de données
2. Ouvrez la collection **`users`**
3. Cliquez sur **Create Attribute**
4. Configurez :
   - **Type** : Boolean
   - **Key** : `approved`
   - **Required** : Oui
   - **Default** : `false`
5. Cliquez sur **Create**

## Étape 2 : Mettre à jour les utilisateurs existants

Pour les utilisateurs déjà existants, vous devez les approuver manuellement :

1. Allez dans la collection **`users`**
2. Pour chaque document, éditez et mettez `approved: true`

Ou utilisez ce script :

```javascript
// approve_existing_users.mjs
import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('69244b9b001284d94352')
    .setKey('YOUR_API_KEY');

const databases = new Databases(client);

async function approveAll() {
    const users = await databases.listDocuments('69244cec00107cfda4b7', 'users');
    
    for (const user of users.documents) {
        await databases.updateDocument(
            '69244cec00107cfda4b7',
            'users',
            user.$id,
            { approved: true }
        );
        console.log(`✅ Approved: ${user.email}`);
    }
}

approveAll();
```

## Étape 3 : Tester

1. Créez un nouveau compte
2. Vérifiez qu'il est bloqué avec le message "En attente de validation"
3. Approuvez-le depuis l'interface admin
4. Vérifiez qu'il peut maintenant accéder

---

**Note** : Les fichiers de code ont été mis à jour automatiquement. Suivez simplement ces étapes dans Appwrite.
